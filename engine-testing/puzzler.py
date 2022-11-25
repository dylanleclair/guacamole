import chess
import chess.engine
from chess.engine import Mate

engine = chess.engine.SimpleEngine.popen_uci("stockfish")

options = {
    # "MultiPV": 3, 
    "UCI_Elo": 1400,
    "UCI_LimitStrength": "true",
}

# set the strength of the engine
engine.configure(options)

print(engine.options)

potential_puzzles = []
potential_moves = []
def make_puzzle():
    board = chess.Board()
    while not board.is_game_over():
        # result = engine.play(board, chess.engine.Limit(time=0.05))
        # board.push(result.move)
        # print(result)

        # print("ANALYSIS")
        info = engine.analyse(board, chess.engine.Limit(time=0.05))
        # print(info)
        # print(info['score'])
        if (info['score']):
            if (info['score'].relative == Mate(3) or info['score'].relative == Mate(-3)):
                # potential_puzzles.append(board.fen())
                # potential_moves.append(info['pv'])
                moves = info['pv']

                line_in_san = []
                # must simulate moves to get correct san ;-;
                board_copy = chess.Board(board.fen())

                for move in moves:
                    line_in_san.append(board_copy.san(move))
                    board_copy.push(move)

                # print(board.san(moves[0]))
                # print(board.variation_san(info['pv']))
                potential_puzzles.append({"start_position": board.fen(), "expected_line": line_in_san})

                print('new puzzle generated!')
                print('posting to database')
                break
        print(info['pv'][0])
        board.push(info['pv'][0])
        
for i in range(3):
    make_puzzle()

# All we need is FEN and moves to get going!!!

# need to alter criteria to pick up different kinds of puzzles
# look for:
# - swings in analysis
# - mate in 3
# - mate in 2
# - mate in 1

print(potential_puzzles)

engine.quit()