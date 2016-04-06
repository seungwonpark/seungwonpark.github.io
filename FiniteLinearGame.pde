PFont f;
int state[] = new int[10];
int col[] = {255,127,1};
int des[] = new int[10];
Table table;
int f(int z){
  if(19 < z && z < 380){
    return (z-20)/120;
  }
  else return -1;
}
void setup(){
  size(800,450);
  background(200);
  table = loadTable("gameinfo.csv","header");
  squares();
  f = createFont("Arial",50);
  textFont(f);
  text("Goal",420,50);
  newState();
}
  
void draw(){
}

void squares(){
  int i,j;
  for(i=0;i<3;i++){
    for(j=0;j<3;j++){
      int k = 1+j+3*i;
      fill(col[state[k]%3]);
      rect(20+120*j,20+120*i,110,110,15);
    }
  }
}
void mouseClicked(){
  int x,y;
  x=f(mouseX);
  y=f(mouseY);
  if(x!=-1 && y!=-1){
    int k = 1+x+3*y;
    TableRow rowk = table.getRow(k);
    for(int i=1;i<=9;i++){
      int val = rowk.getInt(i);
      if(val==1) state[i]++;
    }
    squares();
  }
  anscheck();
}
void anscheck(){
  int i;
  for(i=1;i<=9;i++){
    if(state[i]!=des[i]) break;
  }
  if(i==10){
    newState();
  }
}
void newState(){
  for(int i=1;i<=9;i++){
    des[i] = (int)(random(0,3));
  }
  for(int i=0;i<3;i++){
    for(int j=0;j<3;j++){
      int k = 1+j+3*i;
      fill(col[des[k]]);
      rect(420+60*j,100+60*i,55,55,5);
    }
  }
}