import matplotlib.pyplot as plt
import matplotlib.animation as animation
import random
import heapq
from collections import deque

# --- Puzzle setup ---
goal = [1,2,3,4,5,6,7,8,0]
N = 3

def idx_to_rc(i): return divmod(i, N)
def swap(arr,i,j): 
    a = arr.copy()
    a[i],a[j] = a[j],a[i]
    return a

def manhattan(state):
    d=0
    for i,v in enumerate(state):
        if v==0: continue
        r1,c1 = idx_to_rc(i)
        r2,c2 = idx_to_rc(v-1)
        d += abs(r1-r2)+abs(c1-c2)
    return d

def neighbors(state):
    z = state.index(0)
    r,c = idx_to_rc(z)
    moves=[]
    for dr,dc in [(1,0),(-1,0),(0,1),(0,-1)]:
        nr,nc=r+dr,c+dc
        if 0<=nr<N and 0<=nc<N:
            ni = nr*N+nc
            moves.append(swap(state,z,ni))
    return moves

def serialize(s): return tuple(s)

# --- A* implementation ---
def astar(start, limit=200000):
    open_set=[]
    heapq.heappush(open_set,(manhattan(start),0,start))
    gscore={serialize(start):0}
    parent={serialize(start):None}
    steps=0; expanded=0

    while open_set:
        f,g,state=heapq.heappop(open_set)
        steps+=1
        if state==goal:
            # reconstruct
            path=[]
            cur=serialize(state)
            while cur is not None:
                path.append(list(cur))
                cur=parent[cur]
            return path[::-1],steps,expanded
        expanded+=1
        if steps>limit: return None,None,None

        for nb in neighbors(state):
            nbk=serialize(nb)
            tg=g+1
            if nbk not in gscore or tg<gscore[nbk]:
                gscore[nbk]=tg
                parent[nbk]=serialize(state)
                heapq.heappush(open_set,(tg+manhattan(nb),tg,nb))
    return None,None,None

# --- Scramble ---
def scramble(moves=20):
    s=goal[:]
    for _ in range(moves):
        s=random.choice(neighbors(s))
    return s

# --- Visualization ---
class PuzzleVisualizer:
    def __init__(self,start):
        self.start=start
        self.current=start[:]
        self.path=[]
        self.fig,self.ax=plt.subplots()
        self.ax.axis("off")
        self.txt=self.ax.text(0.5,1.05,"",ha="center",va="bottom",transform=self.ax.transAxes)
        self.speed=500  # ms per frame
        self.anim=None
        self.draw_board(self.current)

    def draw_board(self,state):
        self.ax.clear()
        self.ax.axis("off")
        for i,v in enumerate(state):
            r,c=divmod(i,N)
            if v!=0:
                self.ax.add_patch(plt.Rectangle((c,r),1,1,fc="skyblue",ec="black"))
                self.ax.text(c+0.5,r+0.5,str(v),ha="center",va="center",fontsize=16,fontweight="bold")
            else:
                self.ax.add_patch(plt.Rectangle((c,r),1,1,fc="white",ec="gray",linestyle="--"))
        self.ax.set_xlim(0,N); self.ax.set_ylim(0,N)
        self.ax.invert_yaxis()

    def do_solve(self):
        self.path,steps,expanded = astar(self.current)
        if not self.path: 
            self.txt.set_text("No solution found")
        else:
            self.txt.set_text(f"Solved in {len(self.path)-1} moves | Steps={steps}, Expanded={expanded}")

    def animate_solution(self):
        if not self.path: self.do_solve()
        if not self.path: return
        def update(frame):
            self.current=self.path[frame]
            self.draw_board(self.current)
            self.txt.set_text(f"Step {frame}/{len(self.path)-1}")
        self.anim=animation.FuncAnimation(self.fig,update,frames=len(self.path),interval=self.speed,repeat=False)
        plt.show()

    def step_once(self):
        if not self.path: self.do_solve()
        if not self.path: return
        idx=self.path.index(self.current)
        if idx+1<len(self.path):
            self.current=self.path[idx+1]
            self.draw_board(self.current)
            self.fig.canvas.draw_idle()

    def reset(self):
        self.current=goal[:]
        self.path=[]
        self.draw_board(self.current)
        self.fig.canvas.draw_idle()

# --- Example usage ---
start_state = scramble(15)
viz = PuzzleVisualizer(start_state)
viz.do_solve()
viz.animate_solution()
