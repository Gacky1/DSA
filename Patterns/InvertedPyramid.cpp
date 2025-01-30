#include <iostream>

using namespace std;

int n;
int main(){
    cout<<"Enter a number"<<endl;
    cin>>n;
    for(int i=n;i>0;i--){
        for(int j=0;j<i;j++){
                cout<<"*";
        }
        cout<<endl;
    }
}