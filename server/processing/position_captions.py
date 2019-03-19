# This script will manipulate XML's VP, TCI, JC, etc
# Takes in an array of face locations master list
# Returns an XML with positioning
# Keep track of locations in (horizontal avg, bottom)

import xml.etree.ElementTree as ET
import json
import math
import os
import sys
import boto3
import botocore
import decimal

# Helper class to convert a DftggttttynamoDB item to JSON.
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)


def time_code2seconds(tci, fps=25):
    hours = int(tci[0:2])
    minutes = int(tci[2:4])
    seconds = int(tci[4:6])
    frames = int(tci[6:8])
    milliseconds = frames / fps
    total_in_seconds = hours * 60 * 60 + minutes * 60 + seconds + milliseconds
    return total_in_seconds


# Disable printing
def blockPrint():
    sys.stdout = open(os.devnull, 'w')


# Restore printing
def enablePrint():
    sys.stdout = sys.__stdout__


def position_captions(working_dir, input_stl, selected_speakers_list):
