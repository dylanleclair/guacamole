import requests
import json

f = open("../sampledata/puzzles.json", "r")


lines = f.readlines()
puzzles = [json.loads(x) for x in lines]

print(puzzles)

count = 0
for puzzle in puzzles:
    print("posted puzzle", count)
    requests.post('http://localhost:3000/api/puzzles', data=puzzle)
    count += 1 