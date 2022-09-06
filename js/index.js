function Mine(tr,td,mineNum){
    this.tr = tr;    // 行数
    this.td = td;    // 列数
    this.mineNum = mineNum;  //雷的数量

    this.squares = [];  // 存储所有方块信息，按行列方式排放
    this.tds = [];      // 存储所有单元格对象
    this.surplusMine = mineNum  //剩余雷数量
    this.allRight = false;      //右击标记的是否全是雷,用户是否游戏成功
    this.parent = document.querySelector('.gameBox');
}

Mine.prototype.randomNum = function(){
    var square = new Array(this.tr * this.td);  //生成一个空数组，长度为格子总数
    for(var i = 0; i < square.length; i ++){
        square[i] = i;
    }
    square.sort(function(){return 0.5-Math.random()});
    return square.slice(0,this.mineNum);
}

Mine.prototype.init = function (){
    this.surplusMine = this.mineNum;
    var rn = this.randomNum();   //雷的数组
    var n = 0;  // 用来找到格子对应的索引
    for(var i =0 ;i < this.tr;i++){
        this.squares[i] = [];
        for(var j = 0 ;j < this.td; j++){

            //取一个方块在数组里的数据要使用行与列的形式去取，找方块周围方块要用坐标去取
            if(rn.indexOf(++n) != -1){
                //索引在雷的数组里找到了，这个索引对应的格子是个雷
                this.squares[i][j] = {type:'mine', x:j, y:i};
            }else{
                this.squares[i][j] = {type:'number', x:j, y:i,value:0};
            }
        }
    }


    this.upDateNum();  //更新雷旁边的所有数字
    this.createDom();  //创建格子


    //将右键弹出的表单给删除
    this.parent.oncontextmenu = function(){
        return false;
    }
    
    //剩余雷数
    this.mineNumDom = document.querySelector('.mineNum');
    this.mineNumDom.innerHTML = this.surplusMine;

};

//创建表格
Mine.prototype.createDom = function (){
    var This = this;
    var table = document.createElement('table');
    for(var i = 0; i < this.tr; i++){
        var domTr = document.createElement('tr');
        this.tds[i] = [];

        for(var j = 0; j < this.td; j++){
            var domTd = document.createElement('td');
            // domTd.innerHTML = 0;

            domTd.pos = [i,j];   // 把格子对应的行与列存到格子身上，为下面通过这个值去数组里取到对应数据
            domTd.onmousedown = function(){
                This.play(event,this);   //This 指实例对象，this 指的点击的那个格子
            };

            this.tds[i][j] = domTd;    // 这里是把所有创建的td添加到数组中

            // if(this.squares[i][j].type == 'mine'){
            //     domTd.className = 'mine';
            // }

            // if(this.squares[i][j].type == 'number'){
            //     domTd.innerHTML = this.squares[i][j].value;
            // }

            domTr.appendChild(domTd);
        }
        table.appendChild(domTr);
    }

    this.parent.innerHTML = ''; //避免多次点击创建多个
    this.parent.appendChild(table);
};

//  找某个方格周围的8个方格
Mine.prototype.getAround = function(square){
    var x = square.x;
    var y = square.y;
    var result = [];  // 把找到的格子的坐标返回出去（二维）

    /*
            x-1 y-1      x y-1      x+1 y-1
            x-1 y        x y        x+1 y
            x-1 y+1      x,y+1      x+1 y+1
    */
    //通过坐标去循环到九宫格
    for(var i = x-1; i <= x+1; i++){
        for(var j = y-1; j <= y+1; j++){
            if(
                i < 0 ||    //格子超出四个角的范围
                j < 0 || 
                i > this.td-1    ||  
                j > this.tr-1    ||
                (i == x && j == y) ||    //自身
                this.squares[j][i].type == 'mine'  //雷
                
            ){
                continue;
            }
            result.push([j,i]); //要以行列形式返回出去
            
        }
    }

    return result;
};

//更新所有数字
Mine.prototype.upDateNum = function(){
    for(var i = 0; i < this.tr; i++){
        for(var j = 0; j < this.td; j++){
            //只更新的是雷周围的数字
            if(this.squares[i][j].type == 'number'){
                continue;
            }

            //获取每一个雷周围的数字的格子
            var num = this.getAround(this.squares[i][j]);

            for(var k = 0; k < num.length; k++){
                this.squares[ num[k][0] ][ num[k][1] ].value += 1;
            }
        }
    }
}

Mine.prototype.play = function(ev,obj){
    var This = this;
    if(ev.which == 1 && obj.className != 'flag'){ 
        //点击的是左键
        var curSquare = this.squares[obj.pos[0]][obj.pos[1]];
        var cl = ['zero','one','two','three','four','five','six','seven','eight'];

        
        if(curSquare.type == 'number'){
            //用户点到的是数字
            obj.innerHTML = curSquare.value;
            obj.className = cl[curSquare.value];


            if(curSquare.value == 0){
                //点到0了
                // 1.显示自己
                // 2.找四周
                //    1.显示四周
                //    2.如果值为0     递归
                obj.innerHTML = '';    //0为空
                function getAllZero(square){
                    var around = This.getAround(square); //找到了周围的格子，二维数组

                    for(var i = 0; i < around.length; i++){
                        var x = around[i][0];
                        var y = around[i][1];

                        This.tds[x][y].className = cl[This.squares[x][y].value];

                        if(This.squares[x][y].value == 0){
                            //如果以某个格子为中心找到的 格子值为0 则递归

                            if(!This.tds[x][y].check){
                                //给对应的td填一个属性，这条属性用于决定这个格子有没有被找过
                                This.tds[x][y].check = true;
                                getAllZero(This.squares[x][y]);
                            }
                            
                        }else{
                            //如果以某个格子为中心，找到的格子不为0 那就直接显示
                            This.tds[x][y].innerHTML = This.squares[x][y].value;
                        }
                    }
                    

                }
                getAllZero(curSquare);

            }
        }else{
            //用户点到的是雷
            this.gameOver(obj);
        }
    }

    //用户点击的是右键
    if(ev.which == 3){
        //如果右击的是一个数字，那就不能点击
        if(obj.className && obj.className != 'flag'){
            return ;
        }
        obj.className = obj.className == 'flag' ? '':'flag';

        if(this.squares[obj.pos[0]][obj.pos[1]].type == 'mine'){
            this.allRight = true; //用户标的小红旗都是雷
        }
        else{
            this.allRight = false;
        }

        if(obj.className == 'flag'){
            this.mineNumDom.innerHTML = --this.surplusMine;
        }else{
            this.mineNumDom.innerHTML = ++this.surplusMine;
        }
        
        if(this.surplusMine == 0){
            //剩余雷数量为0 表示用户已经标完小红旗了，这时候判断游戏结束或成功
            if(this.allRight == true){
                alert('恭喜!');
            }else{
                alert('游戏失败');
                this.gameOver();
            }
        }
    }

};

//游戏失败
Mine.prototype.gameOver = function (clickTd){
    /*
        1.显示所有雷
        1.取消所有格子的点击事件
        3.给点中的那个雷标上一个红色背景
    */

    for(var i = 0; i < this.tr; i++){
        for(var j = 0; j< this.td; j++){
            if(this.squares[i][j].type == 'mine'){
                this.tds[i][j].className = 'mine';
            }

            this.tds[i][j].onmousedown = null;
        }
    }

    if(clickTd){
        clickTd.style.backgroundColor = '#f00';
    }
}

// var mine = new Mine(28,28,99);
// mine.init();


//上边button功能
var btns = document.querySelectorAll('.level button');
var mine = null;   //用来存储生成的实例 
var ln = 0;        //用来处理当前选中的状态
var arr = [[9,9,10],[16,16,40],[28,28,99]];   //不同级别行数列数雷数

for(let i = 0; i < btns.length - 1; i++){
    btns[i].onclick = function(){
        btns[ln].className = '';
        this.className = 'active';

        mine = new Mine(...arr[i]);
        mine.init();

        ln = i;
    }
}

btns[0].onclick();   //初始化一下
btns[3].onclick = function(){
    mine.init();
}


