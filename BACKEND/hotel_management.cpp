#include<iostream>
using namespace std;

int main(){
    int quant;
    int choice;
    
    //Qunatity
    int Qrooms = 0 , Qpasta = 0  , Qburger = 0, Qshake = 0;
    int Qnoodeles = 0, Qchicken = 0;
    
    //Food items sold
    int Srooms = 0 , Spasta = 0, Sburger = 0,Snoodles = 0,Sshake = 0 ,Schicken = 0;
    
    //Total proce of items 
    int Total_rooms = 0, Total_pasta = 0 ,Total_burger = 0 ,Total_noodles = 0 ,Total_shake = 0,Total_chicken = 0;


    cout<<"\n\t Quantity of items we have";
    cout<<"\n Rooms Available: ";
    cin>>Qrooms;
    cout<<"\n Quantity of Pasta :";
    cin>>Qpasta;
    cout<<"\n Quantity of burger : ";
    cin>>Qburger;
    cout<<"\n Qunatity of noodles : ";
    cin>>Qnoodeles;
    cout<<"\n Quantity of shake : ";
    cin>>Qshake;
    cout<<"\n Quantity of chicken-roll : ";
    cin>>Qchicken;

    while(1){
        cout<<"\n\t\t Please select froom the menu options: ";
    cout<<"\n\n1) Rooms";
    cout<<"\n2) Pasta";
    cout<<"\n3) Burger";
    cout<<"\n4) Noodles";
    cout<<"\n5) Shake";
    cout<<"\n6) Chicken-roll";
    cout<<"\n7) Information regarding sales and collections";
    cout<<"\n8) Exit";

    cout<<"\n\n please Enter your choice";
    cin>>choice;
    
    switch (choice)
    {
        case 1:
            cout<<"\n\nEnter the number of rooms you want : ";
            
            cin>>quant;
            if(Qrooms - Srooms >=quant){
                Srooms  += quant;
                Total_rooms += (quant*1200);
                cout<<"\n\n\t\t "<<quant<<"rooms/rooms have been allocated for you";
            }else{
                cout<<"\n\tOnly"<<Qrooms - Srooms<< "Rooms remaining break";
            }
            break;
        case 2:
            cout<<"\n\nEnter your Pasta Quantity : ";
            
            cin>>quant;
            if(Qpasta - Spasta >=quant){
                Spasta  += quant;
                Total_pasta += (quant*250);
                cout<<"\n\n\t\t "<<quant<<"pasta is the order!";
            }else{
                cout<<"\n\tOnly"<<Qpasta - Spasta<< "Pasta remaining int hte Hotel";
            }
        case 3:
            cout<<"\n\nEnter your Buger Quantity : ";
            
            cin>>quant;
            if(Qburger - Sburger >=quant){
                Sburger  += quant;
                Total_burger += (quant*250);
                cout<<"\n\n\t\t "<<quant<<"burger is the order!";
            }else{
                cout<<"\n\tOnly"<<Qburger - Sburger<< "Burger remaining int hte Hotel";
            }
            break;
        case 4:
            cout<<"\n\nEnter your Noodles Quantity : ";
            
            cin>>quant;
            if(Qnoodeles - Snoodles >=quant){
                Snoodles  += quant;
                Total_noodles += (quant*250);
                cout<<"\n\n\t\t "<<quant<<"noodles is the order!";
            }else{
                cout<<"\n\tOnly"<<Qnoodeles - Snoodles<< "Noodles remaining int hte Hotel";
            }
            break;
        case 5:
            cout<<"\n\nEnter your Shakes Quantity : ";
            
            cin>>quant;
            if(Qshake - Sshake >=quant){
                Sshake  += quant;
                Total_shake += (quant*140);
                cout<<"\n\n\t\t "<<quant<<"shakes is the order!";
            }else{
                cout<<"\n\tOnly"<<Qshake - Sshake<< "Shakes remaining int hte Hotel";
            }
            break;

        case 6:
            cout<<"\n\nEnter your Chicken roll Quantity : ";
            
            cin>>quant;
            if(Qchicken - Schicken >=quant){
                Schicken += quant;
                Total_chicken += (quant*120);
                cout<<"\n\n\t\t "<<quant<<"shakes is the order!";
            }else{
                cout<<"\n\tOnly"<<Qchicken - Schicken<< "Chicken roll remaining int hte Hotel";
            }
            break;
        case 7:
            cout<<"DETAILS OF SALES AND COLLECTONS \n";
            cout<<"\n\n Number of rooms we had : "<<Qrooms;
            cout<<"\n\n Number of rooms we gave for rent "<<Srooms;
            cout<<"\n\n Remaining rooms : "<<Qrooms  - Srooms;
            cout<<"\n\n Total rooms collections for the  day : "<<Total_rooms;

            cout<<"\n\n Number of pastas we had : "<<Qpasta;
            cout<<"\n\n Number of pastas sold :  "<<Spasta;
            cout<<"\n\n Remaining pastas : "<<Qpasta  - Spasta;
            cout<<"\n\n Total pasta collections for the  day : "<<Total_pasta;

            cout<<"\n\n Number of burgers we had : "<<Qburger;
            cout<<"\n\n Number of burgers sold :  "<<Sburger;
            cout<<"\n\n Remaining burgers : "<<Qburger  - Sburger;
            cout<<"\n\n Total burgers collections for the  day : "<<Total_burger;

            cout<<"\n\n Number of noodles we had : "<<Qnoodeles;
            cout<<"\n\n Number of noodles sold :  "<<Snoodles;
            cout<<"\n\n Remaining noodles : "<<Qnoodeles  - Snoodles;
            cout<<"\n\n Total noodles collections for the  day : "<<Total_noodles;
            
            cout<<"\n\n Number of shakes we had : "<<Qshake;
            cout<<"\n\n Number of shakes sold :  "<<Sshake;
            cout<<"\n\n Remaining shakes: "<<Qshake  - Sshake;
            cout<<"\n\n Total shakes collections for the  day : "<<Total_shake;
            
            cout<<"\n\n Number of Chicken roll we had : "<<Qchicken;
            cout<<"\n\n Number of Chicken roll sold :  "<<Schicken;
            cout<<"\n\n Remaining shakes: "<<Qchicken  - Schicken;
            cout<<"\n\n Total shakes collections for the  day : "<<Total_chicken;

        case 8:
            exit(0);
        default:
        cout<<"invalid options try again";
            
        }
    
    }

}