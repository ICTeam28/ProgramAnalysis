Title: ESC/Java2
Date: 11.03.2014
Category: Tools for Program Analysis
Tags: pelican, publishing
Author: Nandor Licker
Summary: Overview of ESC/Java2

ESC/Java2 (**E**xtended **S**tatic **C**hecker for Java) is tool which can
detect common runtime errors in Java programs by analysing the source code
and checking assertions specified by programmers using annotations placed
inside specialised comments. [@Rustan] It uses *Simplify*, a theorem prover
developed by Microsoft Research, to prove the correctess of the assertions.
[@Simplify] The tool is neither sound nor complete: it might report false
positives, prompting programmers to create stronger assertions, or it might
fail to detect certain mistakes.

Errors
------

The errors that can be detecting using ESC/Java2 include:

1. **Null**: Reported when a reference might be null
2. **IndexNegative**: Caused by negative array indices
3. **IndexTooBig**: Reported when an array index might fall out of bounds
4. **Pre**: Precondition does not hold
5. **Post**: Postcondition does not hold
6. **Assert**: User defined assertion fails
7. **ZeroDiv**: Reported when a division by zero might occur

Usage
-----

By default, ESC/Java2 will complain about null references.

    void getSize(int[] a) {
      return a.length;  // Null: a might be null
    }

Preconditions can be used to tell the analyser that a reference is not null.
If a precondition is used, the analyser will check whether the arguments
passed to functions meet all the conditions.

    //@ requires a != null
    void getSize(int[] a) {
      return a.length;  // allright!
    }

    void callNull() {
      getSize(null);    // Pre: precondition violated, a == null
    }

Postconditions can be used to check whether the return values of functions are
live up to the specification:

    //@ ensures a == \old(a) * 4
    void fastQuarter(int a) {
      return a - 4;     // Post: postcondition violated, (a - 4) * 4 != a
    }

    //@ ensures a == \old(a) * 4
    void fastQuarter(int a) {
      return a >> 2;    // allright!
    }

ESC/Java2 will try to infer the values of array indices and prove that they lie
inside bounds.

    int[] arr;
    void getItem(int idx) {
      return arr[idx];    // IndexTooBig: size of arr is unknown
    }

Invariants can be used to specify the lengths of arrays, whilst the values of
indices can be bounded using preconditions and assertions. Invariants are
expressions that must be valid at any point in the program.

    int[] arr;
    //@ invariant arr.length > 10

    //@ pre idx < 10
    void getItem(idx) {
      return arr[idx];    // `idx < arr.length` can be proven
    }

Example
-------

Although ESC/Java2 might be able to prove that a minesweeper AI will never step
on a bomb as long as it can find a safe spot, we are going to do an easier
example: proving that a Minesweeper game is correct.

We start by declaring the number of rows & columns of the field, which
obviously must be natural number:

    //@ invariant rows > 0
    private int rows;

    //@ invariant cols > 0
    private int cols;

We require two matrices which identify fields that contain bombs and fields
that were already revealed. We are also telling ESC/Java that we know the
matrices cannot be null and their dimensions are known:

    /*@ invariant field != null & field.length == rows;
        invariant (\forall int i; 0 <= i & i < rows ==>
          (field[i] != null & field[i].length == cols)
        )
    @*/
    private boolean field[][];

    /*@ invariant revealed != null & revealed.length == rows;
        invariant (\forall int i; 0 <= i & i < rows ==>
          (revealed[i] != null & revealed[i].length == cols)
        )
    @*/
    private boolean revealed[][];

A variable will keep track of the number of mines:

    //@ invariant 0 <= mines
    private int mines;

And another one will tell us whether the player blew up or is still alive:

    private boolean alive;

The constructor of the class will initialise the member variables to values
which estabilish the invariants:

    /*@ requires rows > 0 & cols > 0; @*/
    public Minesweeper(int rows, int cols) {
      this.rows = rows;
      this.cols = cols;
      field = new boolean[rows][cols];
      revealed = new boolean[rows][cols];
      alive = true;
      mines = 0;

      // Place mines on random positions
      Random r = new Random();
      for (int i = 0; i < rows; ++i) {
        for (int j = 0; j < cols; ++j) {
          if (r.nextInt() % 5 == 0) {
            field[i][j] = true;
            mines++;
          }

          field[i][j] = (r.nextInt() % 5 == 0) ? true : false;
        }
      }
    }

As long as the number of rows and columns given to the constructor are valid,
ESC/Java2 can prove that the code estabilishes the invariant for us.

An interesting method is the one which checks whether the game was won or not:

    /*@ modifies \nothing;
        ensures \result ==> alive
    @*/
    public boolean isWon() {
      int count = 0;

      for (int i = 0; i < rows; ++i) {
        for (int j = 0; j < cols; ++j) {
          count += revealed[i][j] ? 1 : 0;
        }
      }

      return alive && count + mines == rows * cols;
    }

The modifies \nothing pragma is used to tell ESC/Java2 that the function is
pure, i.e. it has no side effects and does not modify the code. The
postcondition estabilishes that the game cannot be won by a dead player.

Apparently, the most complex function is one of the shortest ones: mark. Due to
the fact that we only allow live players to mark a field and we want to kill
a player that steps on a mine, we have to write a couple of assertions:

    /*@ requires 1 <= r && r <= rows;
        requires 1 <= c && c <= cols;
        requires alive;
        modifies alive;
        modifies revealed[r - 1][c - 1];
        ensures !alive ==> field[r - 1][c - 1]
    @*/
    public void mark(int r, int c) {
      if (field[r - 1][c - 1]) {
        alive = false;
      }

      revealed[r - 1][c - 1] = true;
    }

Finally, we can put all the functions together to create the game:

    public static void main(String[] args)
      throws IllegalArgumentException
    {
      Scanner in = new Scanner(System.in);
      System.out.println("Please enter the number of rows and columns");

      int rows = in.nextInt();
      int cols = in.nextInt();

      if (rows <= 0 || cols <= 0) {
        throw new IllegalArgumentException("Invalid field size");
      }

      Minesweeper game = new Minesweeper(rows, cols);
      while (game.isAlive() && !game.isWon()) {
        int r = 1, c = 1;

        System.out.println(game.toString());
        do {
          System.out.print("Enter coordinates: ");
          r = in.nextInt();
          c = in.nextInt();
        } while (r <= 0 || r > game.getHeight() ||
                 c <= 0 || c > game.getWidth());

        game.mark(r, c);
      }

      System.out.println(game.toString());

      if (game.isWon()) {
        //@ assert game.alive
        System.out.println("Congratulatios, you win!");
      } else {
        System.out.println("You loose!");
      }
    }


If we run ESC/Java2 on the source code, it will tell us that it cannot detect
any errors. This does not mean that our code is free of any kind of errors, but
at least we know that it does not hide silly typos.

Complete source code can be found [here](https://gist.github.com/nandor/9494124).


Conclusion
----------

Although ESC/Java2 is quite slow and uses insane ammounts of memory, it can be
used to verify the correctness of programs which run in environments where
safety is paramount.

References
==========

[@Rustan "K. Rustan M. Leino, Greg Nelson, and James B. Saxe. ESC/Java User's Manual, 2000:"]: ftp://gatekeeper.research.compaq.com/pub/DEC/SRC/technical-notes/SRC-2000-002.html
[@Simplify "D. Detlefts, G. Nelson, and J. Saxe. Simplify: A Theorem Prover for Program Checking"]: http://research.microsoft.com/en-us/um/people/qadeer/cse599f/papers/p365-detlefs.pdf
