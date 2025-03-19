// Given a number N, the task is to return the count of digits in this number.
// Example:
// N=9235, Output=4
// N=7, Output=1

// Iterative C++ program to count
// number of digits in a number
#include <bits/stdc++.h>
using namespace std;

int countDigit(long long n)
{
	if (n == 0)
		return 1;
	int count = 0;
	while (n != 0) {
		n = n / 10;
		++count;
	}
	return count;
}

// Driver code
int main(void)
{
	int long long n;
    cout<<"Enter the number"<<endl;
    cin>>n;
	cout << "Number of digits : " << countDigit(n);
	return 0;
}