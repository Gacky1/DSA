
#include <bits/stdc++.h>
using namespace std;

class Solution {
  public:
    bool isPalindrome(int n) {
        // Code here.
        int rev=0;
        int temp=n;
        while(temp!=0){
            rev=(rev*10)+(temp%10);
            temp=temp/10;
        }
        return (rev==n);
    }
};

int main() {
    int T;
    cin >> T;
    while (T--) {
        int n;
        cin >> n;
        Solution ob;
        bool ans = ob.isPalindrome(n);
        cout << (ans ? "true" : "false") << "\n~\n";
    }
    return 0;
}

