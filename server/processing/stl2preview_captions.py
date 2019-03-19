# Takes in an STL & frame locations and return preview texts
# TODO
# TODO Find all the STL2STLXML files required to run this
# TODO Need to set up AWS DB and bucket


import xml.etree.ElementTree as ET
import json
import os
import boto3
import decimal


def time_code2seconds(tci, fps=25):
    hours = int(tci[0:2])
    minutes = int(tci[2:4])
    seconds = int(tci[4:6])
    frames = int(tci[6:8])
    milliseconds = frames / fps
    total_in_seconds = hours * 60 * 60 + minutes * 60 + seconds + milliseconds
    return total_in_seconds


# Helper class to convert a DftggttttynamoDB item to JSON.
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)


def generate_preview_captions(working_dir, input_stl):
    # Extract the file name without the extension
    base = os.path.basename(f"{working_dir}{input_stl}")
    extracted_file_name = os.path.splitext(base)[0]

    # Read frame locations from dynamoDB
    dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-2')
    table = dynamodb.Table('y-face')

    try:
        response = table.get_item(
            Key={
                'fileName': extracted_file_name,
            }
        )
    except ClientError as e:
        print(e.response['Error']['Message'])
    else:
        item = response['Item']
        item = json.dumps(item, cls=DecimalEncoder)

    # Get fps and image locations in frame
    item = json.loads(item)
    fps = item["fps"]
    img_locations = item['frames']

    # convert input stl to stlxml
    os.system(
        f"python stl2stlxml.py \
        {working_dir}{input_stl} -p \
        -x {working_dir}{input_stl}.xml")

    # To collect preview_captions
    preview_captions_list = []

    # # Read and parse image locations
    # with open(working_dir + input_frames_json) as json_file:
    #     img_locations = json.load(json_file)
    #
    # # TODO this function would need fps as an input
    # fps = 25.0  # HACK

    # Parse XML
    tree = ET.parse(f"{working_dir}{input_stl}.xml")
    root = tree.getroot()

    # To iterate all the frames for preview images
    img_index = 0

    for img_index in range(len(img_locations)):

        # So that if no subtitle is found, add an empty preview captions instead
        subtitle_found = False

        # For each frame that corresponds to a preview image,
        # Run through all of the subtitles until it finds a subtitle
        # where the frame is shown
        for tti in root[1][0]:

            # Calculate start and end frames
            tci = time_code2seconds(tti.find('TCI').text, fps)
            tco = time_code2seconds(tti.find('TCO').text, fps)

            # Is the frame in this subtitle?
            if img_locations[img_index] >= tci * fps \
                    and img_locations[img_index] <= tco * fps:

                # print("Image Location:")
                # print(tci * fps, img_locations[img_index], tco * fps)
                #
                # Count # of DoubleHeight, StartBox, and space.
                double_height = 0
                start_box = 0
                space = 0

                # Defaul color
                first_color = 'white'
                second_color = 'white'

                # words_list will hold all the words found in each subtitle
                words_list = []
                text_index = 0
                tf = tti.find('TF')

                for word in tf.itertext():
                    if word.strip() != '':
                        words_list.append(word.strip())

                # which will be added to 1st & 2nd sentences
                first_line = ''
                second_line = ''

                for child in tf:

                    if child.tag == 'DoubleHeight':
                        double_height += 1

                    # Find the color of each line
                    elif child.tag == 'AlphaCyan'\
                            or child.tag == 'AlphaYellow'\
                            or child.tag == 'AlphaGreen':

                        if double_height == 1:
                            first_color = child.tag[5:].lower()

                        elif double_height == 2:
                            second_color = child.tag[5:].lower()

                    elif child.tag == 'StartBox':
                        start_box += 1

                    # Count space only when it's between StartBox and EndBox
                    elif double_height == 1 \
                            and start_box == 2 \
                            and child.tag == 'space':
                        space += 1

                    elif double_height == 2 \
                            and start_box == 4 \
                            and child.tag == 'space':
                        space += 1

                    # Add words to the first line
                    if double_height == 1 and start_box == 2 \
                            and text_index < len(words_list) \
                            and text_index <= space:
                        first_line = first_line + words_list[text_index] + ' '
                        text_index += 1

                    # Add words to the second line
                    if double_height == 2 and start_box == 4 \
                            and text_index < len(words_list):
                        second_line = second_line + \
                            words_list[text_index] + ' '
                        text_index += 1

                # Add to preview captions when the subtitle is 1 line
                if double_height == 1:
                    preview_captions_list.append([{
                        "color": first_color,
                        "text": first_line.rstrip()
                    }])
                    subtitle_found = True

                # Add to preview captions when the subtitle is 2 lines
                elif double_height == 2:
                    preview_captions_list.append([{
                        "color": first_color,
                        "text": first_line.rstrip()
                    },
                        {
                        "color": second_color,
                        "text": second_line.rstrip()
                    }])
                    subtitle_found = True

        # If no subtitle is found, add an empty list
        if subtitle_found is False:
            # print("Subtitle Not Found", img_locations[img_index])
            preview_captions_list.append([])

    # Update the status
    response = table.update_item(
        Key={
            'fileName': extracted_file_name,
        },
        UpdateExpression="set lastStatus = :r",
        ExpressionAttributeValues={
            ':r': 'Preview captions genearted.'
        },
        ReturnValues="UPDATED_NEW"
    )

    # Remove the XML file
    os.remove(f"{working_dir}{input_stl}.xml")

    # Return preview_captions_list
    return(json.dumps(preview_captions_list, indent=4))

    # Or save preview_captions_list as a JSON
    # with open(f"./{extracted_file_name}_preview_captions.json", 'w') as fp:
    #     json.dump(preview_captions_list, fp, indent=4, sort_keys=True)


# generate_preview_captions(
#     './sample1_0.60/',
#     'sample1.stl',
#     'sample1.mpg_frames.json')