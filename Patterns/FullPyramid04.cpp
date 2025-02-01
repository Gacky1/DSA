#include <iostream>
using namespace std;

void fullPyramid(int n) {
    for (int i = 1; i <= n; i++) {
        // Printing spaces
        for (int j = 1; j <= n - i; j++) {
            cout << " ";
        }
        // Printing stars
        for (int j = 1; j <= (2 * i - 1); j++) {
            cout << "*";
        }
        cout << endl;
    }
}

int main() {
    int n;
    cout << "Enter the number of rows: ";
    cin >> n;
    fullPyramid(n);
    return 0;
}
