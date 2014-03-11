Most programming languages allow you to write silly things. Static analysers are
there to prevent programmers from writing code like this.

    int *a = NULL;
    // If you do this, you are just evil
    int &b = *a;

    uint64_t wont_fit = 2251799813685248ull;
    // See Ariane 5
    uint16_t small_number = wont_fit;
