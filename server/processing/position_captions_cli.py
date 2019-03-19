import sys
import position_captions
import json

position_captions.position_captions(sys.argv[1], sys.argv[2], json.loads(sys.argv[3]))