import sys
import subprocess
from time import sleep

'''
This file opens a subprocess running the stockfish engine, and communicates with it. You will need it installed on your system. (I tested with MacOS, eventually we can containerize with Docker, once we've established how to integrate the engine.)

In this simple example, it tests against a simple scenario where there is a mate in 2. 

It will return the three best lines, along with the best move and the move it expects the opponent to play. 

Alternatively, the next best thing would be to have the engine run on the client / in browser using WASM. Stockfish.js does this - we could consider implementing the engine this way. 
'''


print("Number of args: "+ str(len(sys.argv)))
print("args:", str(sys.argv))

from enum import Enum

class States(Enum):
    STARTING = 0
    READY = 1
    CALCULATING = 2


engine_state = States.STARTING


# a scheme could be to get a FEN string from a POST request, and reply with the best move

with subprocess.Popen(["stockfish"], stdin=subprocess.PIPE, stdout=subprocess.PIPE) as process:
    def poll_and_read():
            print(f"output from poll: {process.poll()}")
            print(f"Output from stdout: {process.stdout.read1().decode('utf-8')}")

    while True:
        # if the process exits, kill this one
        if (process.poll()!= None):
            break

        output = process.stdout.read1().decode('utf-8')
        print(output)
        if (len(output) > 0):
            if (engine_state == States.STARTING):
                # tell it it's ready!
                process.stdin.write("isready\n".encode("utf-8"))
                process.stdin.flush()
                sleep(1)
                process.stdin.write("setoption name MultiPV value 3\n".encode("utf-8"))
                process.stdin.flush()

                engine_state = States.READY
        

            # now, we have to feed position data in and get analysis
            if (engine_state == States.READY):
                process.stdin.write("position fen '6qk/8/5P1p/8/8/6QP/5PP1/4R1K1 w - - 0 1'\n go depth 18\n".encode("utf-8"))
                process.stdin.flush()  
                engine_state = States.CALCULATING
            
            # wait till the best move (with specified settings) is found
            if (engine_state == States.CALCULATING):
                if ("bestmove" in output):
                    print(f"best move found: {output}")

# should we have the server communicate with the stockfish over websockets or via http? 


    

# write this into a microservice so that you can fetch best move via api ? 