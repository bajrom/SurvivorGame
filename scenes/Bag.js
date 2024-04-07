class Bag extends Phaser.Scene {
    constructor() {
            super('Bag');
    }
    init (data){
        //1 -> les pos initiales,
        //2 -> description de la forme,
        //3 -> position à partir du centre de l'objet,
        //4 -> couleurs,
        //5 -> positions réels,
        //6 -> état (0 = boutique, 1 = dans sac, 2 = visualisation (ne pas bouger), 3 = est à prendre mais n'est pas de la boutique (evolution)),
        //7 -> orientation de l'objet (par défaut Nord = 0),
        //8 -> id de l'objet
        //objets du sac, de la boutique et du stockage
        //pas d'ID car c'est sa position dans le tab
        this.objectPositions = []

        //contiendra les cases remplit et les id des objets
        this.grid_fonctionnel = [[0,0,0,0,0,0,0,0,-1,-1,-1,-1,-1,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,-1,-1,-1,-1,-1,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,-1,-1,-1,-1,-1,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,-1,-1,-1,-1,-1,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,-1,-1,-1,-1,-1,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,-1,-1],
        [0,0,0,0,0,0,0,0,-1,-1],
        [0,0,0,0,0,0,0,0,-1,-1],
        [0,0,0,0,0,0,0,0,-1,-1],
        [0,0,0,0,0,0,0,0,-1,-1]]

        this.difficulty = 0;
        this.life = 100;

        if (typeof data.objets !== 'undefined'){
            console.log('objets',data.objets)
            data.objets.forEach(obj => {
                //si il ne devait pas disparaitre
                if(!obj[4]){
                    this.create_objet_data(obj[0],obj[1],obj[2]);
                }
            })
        }
        if (typeof data.evolution !== 'undefined'){
            console.log('evolution',data.evolution)
            data.evolution.forEach(evo => {
                this.create_objet_data_evo(evo[0],evo[1],evo[2]);
            })
        }
        if (typeof data.grid_fonctionnel !== 'undefined'){
            this.grid_fonctionnel = data.grid_fonctionnel;
        }
        if (typeof data.difficulty !== 'undefined'){
            this.difficulty = data.difficulty + 1;
        }
        if (typeof data.life !== 'undefined'){
            this.life = data.life;
        }
        console.log(this.objectPositions)
    }
    preload() {
        this.largeur = window.innerWidth
        this.hauteur = window.innerHeight
        this.objectPositions
        this.objectController
        this.objectColor
        this.Dragg
        this.surbriance
        this.previsualiser
        this.grid_fonctionnel
        this.stars
        this.categorie
        this.evolution
        this.evolution_actuel
        this.decalage_create_objet
        this.objets_bag
        this.objets_evolution
        this.difficulty
        this.life
    }
    create(){
        this.grid_origin = [this.largeur/4, this.hauteur/5*2, this.hauteur/20]
        //1 -> id de l'objet dragg, 1/2 -> pos initial de l'objet, 3 -> rotation initial de l'objet
        this.Dragg = [-1,0,0,0];
        this.surbriance = [-1,false,-1];
        let nouvPos = false;
        let dragStartX = 0;
        let dragStartY = 0;
        this.previsualiser = [false];
        this.stars = [];
        //est l'objet qui permet d'exporter les données
        this.objets_bag = [];
        this.objets_evolution = [];
        //il n'y à pas la categorie 0, 1 -> tous, 2 -> weapon, 3 -> bonus, 4 -> malus
        this.categorie = [[1,0x555555],[2,0x005500],[3,0x550000],[4,0x000055]]
        //l'objet 0 et 2 donne le 4
        this.evolution = [[0,2,4]]
        this.evolution_actuel = []
        //le décalage à la création réduit le lenght des objets pour ne pas inclure les derniers obj qui ne sont obtensible que par craft
        this.decalage_create_objet = this.evolution.length;

        //0 -> objet orienté nord, 1 -> objet orienté est,2 -> objet orienté sud,3 -> objet orienté ouest,4 -> forme, 5 -> couleurs,6 -> sont texte descriptif,7 -> position de ses étoile, 8 -> catégorie des étoiles visé,9 -> sa catégorie,
        this.objets = [[new Phaser.Geom.Polygon([
            0,0,
            1,0,
            1,1,
            0,1
        ]),
        new Phaser.Geom.Polygon([
            0,0,
            1,0,
            1,1,
            0,1
        ]),
        new Phaser.Geom.Polygon([
            0,0,
            1,0,
            1,1,
            0,1
        ]),
        new Phaser.Geom.Polygon([
            0,0,
            1,0,
            1,1,
            0,1
        ]),[[1]],[0x000099, 0x0000ff],
        [this.add.text(this.grid_origin[0]/5, this.grid_origin[1], 'BONUS', {fill: '#ffffff', wordWrap: { width: 200 },fontSize: '24px', fontFamily: 'Andale Mono'}).setVisible(false),
        this.add.text(this.grid_origin[2]/2, this.grid_origin[1]+this.grid_origin[2]*2, 'each 💀 (ennemies death) regenerate 1 PV', { fill: '#ffffff', wordWrap: { width: 200 }}).setVisible(false)],
        [[],[],[],[]],[0],[3]],
        [new Phaser.Geom.Polygon([
            0, 0,
            1, 0,
            1, 5,
            0, 5
        ]),
        new Phaser.Geom.Polygon([
            0, 0,
            5, 0,
            5, 1,
            0, 1
        ]),
        new Phaser.Geom.Polygon([
            0, 0,
            1, 0,
            1, 5,
            0, 5
        ]),
        new Phaser.Geom.Polygon([
            0, 0,
            5, 0,
            5, 1,
            0, 1
        ]),[[1],[1],[1],[1],[1]],[0x009900, 0x00ff00],
        [this.add.text(this.grid_origin[0]/5, this.grid_origin[1], 'WEAPON', {fill: '#ffffff', wordWrap: { width: 200 },fontSize: '24px', fontFamily: 'Andale Mono'}).setVisible(false),
        this.add.text(this.grid_origin[0]/5, this.grid_origin[1]+this.grid_origin[2]*2, 'DMG : 100', { fill: '#ffffff', wordWrap: { width: 200 }}).setVisible(false),
        this.add.text(this.grid_origin[0]/5, this.grid_origin[1]+this.grid_origin[2]*3, 'COOLDOWN : 5s', { fill: '#ffffff', wordWrap: { width: 200 }}).setVisible(false),
        this.add.text(this.grid_origin[0]/5, this.grid_origin[1]+this.grid_origin[2]*4, 'MANA COST : 10', { fill: '#ffffff', wordWrap: { width: 200 }}).setVisible(false),
        this.add.text(this.grid_origin[2]/2, this.grid_origin[1]+this.grid_origin[2]*5, 'for each ⭐(any item) +35% longer', { fill: '#ffffff', wordWrap: { width: 200 }}).setVisible(false)],
        [[[-2,0],[-1,0],[1,0],[2,0]],
        [[0,-2],[0,-1],[0,1],[0,2]],
        [[-2,0],[-1,0],[1,0],[2,0]],
        [[0,-2],[0,-1],[0,1],[0,2]]],1,[2]],
        [new Phaser.Geom.Polygon([
            0, 0,
            1, 0,
            1, 1,
            2, 1,
            2, 0,
            3, 0,
            3, 2,
            0, 2
        ]),
        new Phaser.Geom.Polygon([
            0, 0,
            2, 0,
            2, 1,
            1, 1,
            1, 2,
            2, 2,
            2, 3,
            0, 3,
        ]),
        new Phaser.Geom.Polygon([
            0, 0,
            3, 0,
            3, 2,
            2, 2,
            2, 1,
            1, 1,
            1, 2,
            0, 2
        ]),
        new Phaser.Geom.Polygon([
            0, 0,
            2, 0,
            2, 3,
            0, 3,
            0, 2,
            1, 2,
            1, 1,
            0, 1
        ]),[[1,0,1],
            [1,1,1]],[0x990000, 0xff0000],
        [this.add.text(this.grid_origin[0]/5, this.grid_origin[1], 'WEAPON', {fill: '#ffffff', wordWrap: { width: 200 },fontSize: '24px', fontFamily: 'Andale Mono'}).setVisible(false),
        this.add.text(this.grid_origin[0]/5, this.grid_origin[1]+this.grid_origin[2]*2, 'DMG : 50', { fill: '#ffffff', wordWrap: { width: 200 }}).setVisible(false),
        this.add.text(this.grid_origin[0]/5, this.grid_origin[1]+this.grid_origin[2]*3, 'COOLDOWN : 5s', { fill: '#ffffff', wordWrap: { width: 200 }}).setVisible(false),
        this.add.text(this.grid_origin[0]/5, this.grid_origin[1]+this.grid_origin[2]*4, 'MANA COST : 10', { fill: '#ffffff', wordWrap: { width: 200 }}).setVisible(false),
        this.add.text(this.grid_origin[2]/2, this.grid_origin[1]+this.grid_origin[2]*5, '-50% DMG +8% for each ⭐(weapon item) transmit per enemy', { fill: '#ffffff', wordWrap: { width: 200 }}).setVisible(false)],
        [[[-1,-1.5],[-1,-2.5],[1,-1.5],[1,-2.5]],
        [[1.5,-1],[2.5,-1],[1.5,1],[2.5,1]],
        [[-1,1.5],[-1,2.5],[1,1.5],[1,2.5]],
        [[-1.5,-1],[-2.5,-1],[-1.5,1],[-2.5,1]]],[2],[2]],
        [new Phaser.Geom.Polygon([
            1, 0,
            2, 0,
            2, 1,
            3, 1,
            3, 2,
            2, 2,
            2, 3,
            1, 3,
            1, 2,
            0, 2,
            0, 1,
            1, 1
        ]),
        new Phaser.Geom.Polygon([
            1, 0,
            2, 0,
            2, 1,
            3, 1,
            3, 2,
            2, 2,
            2, 3,
            1, 3,
            1, 2,
            0, 2,
            0, 1,
            1, 1
        ]),
        new Phaser.Geom.Polygon([
            1, 0,
            2, 0,
            2, 1,
            3, 1,
            3, 2,
            2, 2,
            2, 3,
            1, 3,
            1, 2,
            0, 2,
            0, 1,
            1, 1
        ]),
        new Phaser.Geom.Polygon([
            1, 0,
            2, 0,
            2, 1,
            3, 1,
            3, 2,
            2, 2,
            2, 3,
            1, 3,
            1, 2,
            0, 2,
            0, 1,
            1, 1
        ]),[[0,1,0],
            [1,1,1],
            [0,1,0]],[0x999000, 0xfff000],
        [this.add.text(this.grid_origin[0]/5, this.grid_origin[1], 'WEAPON', {fill: '#ffffff', wordWrap: { width: 200 },fontSize: '24px', fontFamily: 'Andale Mono'}).setVisible(false),
        this.add.text(this.grid_origin[0]/5, this.grid_origin[1]+this.grid_origin[2]*2, 'DMG : 300', { fill: '#ffffff', wordWrap: { width: 200 }}).setVisible(false),
        this.add.text(this.grid_origin[0]/5, this.grid_origin[1]+this.grid_origin[2]*3, 'COOLDOWN : 8s', { fill: '#ffffff', wordWrap: { width: 200 }}).setVisible(false),
        this.add.text(this.grid_origin[0]/5, this.grid_origin[1]+this.grid_origin[2]*4, 'MANA COST : 25', { fill: '#ffffff', wordWrap: { width: 200 }}).setVisible(false),
        this.add.text(this.grid_origin[2]/2, this.grid_origin[1]+this.grid_origin[2]*5, 'for each ⭐(any item) +15% AOE', { fill: '#ffffff', wordWrap: { width: 200 }}).setVisible(false)],
        [[[-1,-1],[-1,1],[1,-1],[1,1],[-2,-2],[-2,2],[2,-2],[2,2]],
        [[-1,-1],[-1,1],[1,-1],[1,1],[-2,-2],[-2,2],[2,-2],[2,2]],
        [[-1,-1],[-1,1],[1,-1],[1,1],[-2,-2],[-2,2],[2,-2],[2,2]],
        [[-1,-1],[-1,1],[1,-1],[1,1],[-2,-2],[-2,2],[2,-2],[2,2]]],[2],[2]],
        [new Phaser.Geom.Polygon([
            0, 0,
            1, 0,
            1, 1,
            2, 1,
            2, 0,
            3, 0,
            3, 2,
            0, 2
        ]),
        new Phaser.Geom.Polygon([
            0, 0,
            2, 0,
            2, 1,
            1, 1,
            1, 2,
            2, 2,
            2, 3,
            0, 3,
        ]),
        new Phaser.Geom.Polygon([
            0, 0,
            3, 0,
            3, 2,
            2, 2,
            2, 1,
            1, 1,
            1, 2,
            0, 2
        ]),
        new Phaser.Geom.Polygon([
            0, 0,
            2, 0,
            2, 3,
            0, 3,
            0, 2,
            1, 2,
            1, 1,
            0, 1
        ]),[[1,0,1],
            [1,1,1]],[0x330000, 0x880000],
        [this.add.text(this.grid_origin[0]/5, this.grid_origin[1], 'WEAPON', {fill: '#ffffff', wordWrap: { width: 200 },fontSize: '24px', fontFamily: 'Andale Mono'}).setVisible(false),
        this.add.text(this.grid_origin[0]/5, this.grid_origin[1]+this.grid_origin[2]*2, 'DMG : 80', { fill: '#ffffff', wordWrap: { width: 200 }}).setVisible(false),
        this.add.text(this.grid_origin[0]/5, this.grid_origin[1]+this.grid_origin[2]*3, 'COOLDOWN : 5s', { fill: '#ffffff', wordWrap: { width: 200 }}).setVisible(false),
        this.add.text(this.grid_origin[0]/5, this.grid_origin[1]+this.grid_origin[2]*4, 'MANA COST : 20', { fill: '#ffffff', wordWrap: { width: 200 }}).setVisible(false),
        this.add.text(this.grid_origin[2]/2, this.grid_origin[1]+this.grid_origin[2]*5, '-50% DMG +50% for each 💀(death by weapon) transmit per enemy', { fill: '#ffffff', wordWrap: { width: 200 }}).setVisible(false)],
        [[],[],[],[]],[2],[2]]];

        this.create_boutique(3);
        this.recherche_evolution();

        //une simple variable pour stocké toute la grille affiché en fonction de la taille du sac
        let grid_affiche = [];
        for (let x = 0; x < 10; x++) {
            for (let t = 0; t < 10; t++){
                if (this.grid_fonctionnel[t][x] !== -1){
                    grid_affiche.push(this.add.rectangle(
                        this.grid_origin[0]+this.grid_origin[2]*x+this.grid_origin[2]/2,
                        this.grid_origin[1]+this.grid_origin[2]*t+this.grid_origin[2]/2,
                        this.grid_origin[2],this.grid_origin[2]).setStrokeStyle(2, 0xffffff).setDepth(0))
                }
            }
        }
        let grille_stockage = [];
        for (let x = 0; x < 5; x++) {
            for (let t = 0; t < 5; t++){
                if (this.grid_fonctionnel[t][x] !== -1){
                    grille_stockage.push(this.add.rectangle(
                        (this.grid_origin[0]+this.grid_origin[2]*13.5)+this.grid_origin[2]*x,
                        this.grid_origin[1]+this.grid_origin[2]*t+this.grid_origin[2]/2,
                        this.grid_origin[2],this.grid_origin[2]).setStrokeStyle(2, 0xffffff).setDepth(0))
                }
            }
        }
        //rect de contour du text
        const cadre_txt = this.add.rectangle(this.grid_origin[0]/2.5,this.grid_origin[1]*1.6,this.grid_origin[2]*5,this.grid_origin[2]*10,0x555555);
        cadre_txt.setAlpha(0.5).setStrokeStyle(5, 0xefc53f).setVisible(false);
        //contour max du sac
        const bag_size = this.add.rectangle(this.grid_origin[0]+this.grid_origin[2]*5, this.grid_origin[1]+this.grid_origin[2]*5, this.grid_origin[2]*10.5, this.grid_origin[2]*10.5);
        bag_size.setStrokeStyle(2, 0xefc53f);
        //contour du cadre des évolution possibles
        const bag_evolution = this.add.rectangle(this.grid_origin[0]+this.grid_origin[2]*15,this.grid_origin[1]+this.grid_origin[2]*8,this.grid_origin[2]*7,this.grid_origin[2]*5);
        bag_evolution.setStrokeStyle(2, 0xefc53f);
        this.add.text(this.grid_origin[0]+this.grid_origin[2]*12,this.grid_origin[1]+this.grid_origin[2]*5.5,"Here evolutions possibles (make items touch to create this item next round)", { fill: '#ffffff', wordWrap: { width: 300 }})
        this.add.text(this.grid_origin[0]+this.grid_origin[2]*12,this.grid_origin[1]+this.grid_origin[2]*9.5,"Also the evolution craft was here (take this item before delete next round)", { fill: '#ffffff', wordWrap: { width: 300 }})
        this.add.text(this.grid_origin[0]+this.grid_origin[2]*13,this.grid_origin[1]-this.grid_origin[2],"Storage", { fill: '#ffffff', fontSize: 50})

        //bouton
        this.start = this.add.text(this.grid_origin[0]*1.5, this.grid_origin[1]*2.3, 'Start battle', { fill: '#FFF', backgroundColor: '#222'})
        .setPadding(10)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            //on remove les autres objet de la boutique
            for (var i = this.objectPositions.length-1; i >= 0; i--){
                if (this.objectPositions[i][5] === 0){
                    this.objectPositions.splice(i,1);
                }
            }
            this.recherche_suppr_evolution();
            this.recherche_evolution();
            this.DataExport();
            // passage à la scène Game
            this.scene.start('Battle', {objets:this.objets_bag, evolution:this.objets_evolution, grid_fonctionnel:this.grid_fonctionnel, difficulty:this.difficulty,life:this.life});
        })
        .on('pointerover', () => this.start.setStyle({ fill: '#FF5733' }))
        .on('pointerout', () => this.start.setStyle({ fill: '#FFF' }));

        this.graphics = this.add.graphics();
        this.affiche_graphics();

        console.log("origine grille :",this.grid_origin[0], this.grid_origin[1], this.grid_origin[2])

        this.input.on('pointermove', pointer =>
        {
            //surbriance si souris sur un obj
            let temp = false
            for (let i = 0; i < this.objectPositions.length; i++){
                if (Phaser.Geom.Polygon.ContainsPoint(this.objectPositions[i][0], pointer)){
                    //si le précédent n'existe pas (souris était sur rien)
                    if(this.surbriance[2] === -1){
                        this.surbriance[2] = this.objectPositions[i][7]
                        //le nouveau à true
                        this.objets[this.surbriance[2]][6].forEach(txt => {
                            txt.setVisible(true);
                        });
                        cadre_txt.setVisible(true);
                        cadre_txt.setFillStyle(this.categorie[this.objets[this.objectPositions[i][7]][9]][1]);
                    }
                    //si le précédent était un autres objet
                    else if(this.surbriance[2] !== this.objectPositions[i][7]){
                        //on met le précédent à false
                        this.objets[this.surbriance[2]][6].forEach(txt => {
                            txt.setVisible(false);
                        });
                        this.surbriance[2] = this.objectPositions[i][7]
                        //le nouveau à true
                        this.objets[this.surbriance[2]][6].forEach(txt => {
                            txt.setVisible(true);
                        });
                        cadre_txt.setVisible(true);
                        cadre_txt.setFillStyle(this.categorie[this.objets[this.objectPositions[i][7]][9]][1]);
                    }

                    this.surbriance[1] = true;
                    this.surbriance[0] = i;
                    temp = true;
                }
            };
            //si sur aucun obj
            if (!temp){
                //si le précédent était un obj on le met à false
                if(this.surbriance[2] !== -1){
                    this.objets[this.surbriance[2]][6].forEach(txt => {
                        txt.setVisible(false);
                    });
                    this.surbriance[2] = -1;
                    cadre_txt.setVisible(false);
                }
                this.surbriance[0] = -1;
                this.surbriance[1] = false;
            }
            //si Dragg
            if (this.Dragg[0] !== -1){
                this.objectPositions[this.Dragg[0]][2][0] = pointer.x - dragStartX
                this.objectPositions[this.Dragg[0]][2][1] = pointer.y - dragStartY
                this.objectPositions[this.Dragg[0]][0] = this.define_geom_polygon(this.objectPositions[this.Dragg[0]])

                var pos = this.conversionCoordToGrid_round0(this.objectPositions[this.Dragg[0]][2][0], this.objectPositions[this.Dragg[0]][2][1]);
                
                if (this.objectPositions[this.Dragg[0]][1].length % 2 === 0){
                    pos[1] -= 0.5
                }
                if (this.objectPositions[this.Dragg[0]][1][0].length % 2 === 0){
                    pos[0] -= 0.5
                }

                this.previsualiser[1][2] = this.conversionGridToCoord(pos[0], pos[1]);

                this.define_arcane_shape(this.objets[this.objectPositions[this.Dragg[0]][7]][7][this.objectPositions[this.Dragg[0]][6]], this.previsualiser[1][2]);

                this.previsualiser[1][0] = this.define_geom_polygon(this.previsualiser[1]);

                temp = this.conversionCoordToGrid_round1(this.previsualiser[1][2][0], this.previsualiser[1][2][1]);
                var grid_temp = this.placeObjectInGrid(this.previsualiser[1][1], temp[0], temp[1]);
                this.previsualiser[0] = true;
                grid_temp.forEach(element => {
                    if(element[0] >= 0 && element[0] <= 9 && element[1] >= 0 && element[1] <= 9){
                        if(this.grid_fonctionnel[element[1]][element[0]] !== 0){
                            this.previsualiser[0] = false;
                        }
                    }
                    else if (element[0] >= 13 && element[0] <= 17 && element[1] >= 0 && element[1] <= 4){
                        if(this.grid_fonctionnel[element[1]][element[0]] !== 0){
                            this.previsualiser[0] = false;
                        }
                    }
                    else{
                        this.previsualiser[0] = false;
                    }
                });

                if(this.previsualiser[0]){
                    this.stars.forEach(star => {
                        star.setVisible(true);
                    });
                    var temp2 = this.placeStarInGrid(this.objets[this.objectPositions[this.Dragg[0]][7]][7][this.objectPositions[this.Dragg[0]][6]],pos[0],pos[1])
                    for (let i = 0; i < temp2.length; i++){
                        if(temp2[i][0] >= 0 && temp2[i][0] <= 9 && temp2[i][1] >= 0 && temp2[i][1] <= 9){
                            if(this.ArrayinArray(this.objets[this.objectPositions[this.Dragg[0]][7]][8],this.grid_fonctionnel[temp2[i][1]][temp2[i][0]])){
                                this.stars[i].setFillStyle(0xefc53f);
                            }
                            else if (this.objets[this.objectPositions[this.Dragg[0]][7]][8] === 1 && this.grid_fonctionnel[temp2[i][1]][temp2[i][0]] !== 0 && this.grid_fonctionnel[temp2[i][1]][temp2[i][0]] !== -1){
                                this.stars[i].setFillStyle(0xefc53f);
                            }
                            else{
                                this.stars[i].setFillStyle();
                            }
                        }
                        else if(temp2[i][0] >= 13 && temp2[i][0] <= 17 && temp2[i][1] >= 0 && temp2[i][1] <= 4){
                            this.stars[i].setFillStyle();
                        }
                    };
                }
                else{
                    this.stars.forEach(star => {
                        star.setVisible(false);
                    });
                }
            }
            this.draw_evolution_lane();

            this.affiche_graphics();
        });

        this.input.on('pointerdown', pointer =>
        {
            for (let i = 0; i < this.objectPositions.length; i++){
                if(this.objectPositions[i][5] !== 2){
                    if (Phaser.Geom.Polygon.ContainsPoint(this.objectPositions[i][0], pointer)){
                        this.Dragg[0] = i
                        this.Dragg[1] = this.objectPositions[i][2][0]
                        this.Dragg[2] = this.objectPositions[i][2][1]
                        this.Dragg[3] = this.objectPositions[i][6];
                        dragStartX = pointer.x - this.objectPositions[i][2][0];
                        dragStartY = pointer.y - this.objectPositions[i][2][1];
                        this.previsualiser = [true];
                        this.previsualiser.push([this.objectPositions[i][0], this.objectPositions[i][1], this.objectPositions[i][2], [0x999999,0x999999],this.objectPositions[i][4]]);
                        
                        var temp = this.conversionCoordToGrid_round1(this.objectPositions[i][2][0], this.objectPositions[i][2][1]);
                        var temp2 = this.conversionGridToCoord(temp[0],temp[1]);
                        this.objets[this.objectPositions[i][7]][7][this.objectPositions[i][6]].forEach(element => {
                            this.stars.push(this.add.star(temp2[0]+element[0],temp2[1]+element[1],5,this.grid_origin[2]/4,this.grid_origin[2]/2).setStrokeStyle(2, 0xefc53f));
                        });
                        this.define_arcane_shape(this.objets[this.objectPositions[i][7]][7][this.objectPositions[i][6]], this.previsualiser[1][2]);
    
                        //on retire les 1 de la grille si l'objet était dans le sac
                        if(this.objectPositions[i][5] === 1){
                            var grid_temp = this.placeObjectInGrid(this.objectPositions[i][1], temp[0], temp[1]);
    
                            grid_temp.forEach(element => {
                                this.grid_fonctionnel[element[1]][element[0]] = 0;
                            });
                        }
                        this.draw_evolution_lane();
    
                        console.log("click sur ",i)
                    };
                }
            };
        });

        this.input.on('pointerup', pointer =>
        {
            if (this.Dragg[0] !== -1){
                //si est dans le bag
                //nouv pos
                if (this.previsualiser[0]){
                    this.objectPositions[this.Dragg[0]][2] = this.previsualiser[1][2];
                    this.objectPositions[this.Dragg[0]][0] = this.previsualiser[1][0];
                    this.previsualiser[1][2] = this.conversionCoordToGrid_round1(this.previsualiser[1][2][0], this.previsualiser[1][2][1]);
                    var temp = this.placeObjectInGrid(this.previsualiser[1][1], this.previsualiser[1][2][0], this.previsualiser[1][2][1]);
                    temp.forEach(element => {
                        this.grid_fonctionnel[element[1]][element[0]] = this.objets[this.objectPositions[this.Dragg[0]][7]][9];
                    });

                    //on indique que l'objet est dans le sac
                    var temp2 = this.objectPositions[this.Dragg[0]][5];
                    this.objectPositions[this.Dragg[0]][5] = 1;
                    this.draw_evolution_lane();

                    //si l'objet est de la boutique
                    if(temp2 === 0){
                        //on remove les autres objet de la boutique
                        for (var i = this.objectPositions.length-1; i >= 0; i--){
                            if (this.objectPositions[i][5] === 0){
                                this.objectPositions.splice(i,1);
                            }
                        }
                    }

                    if(this.surbriance[1] === true){
                        this.surbriance[0] = this.objectPositions.length
                    }
                }
                //si revient en arrière
                else{
                    //tant que l'objet n'est pas à la bonne orientation
                    while (this.Dragg[3] !== this.objectPositions[this.Dragg[0]][6]){
                        this.rotateObject();
                    }

                    this.objectPositions[this.Dragg[0]][2][0] = this.Dragg[1];
                    this.objectPositions[this.Dragg[0]][2][1] = this.Dragg[2];
                    this.objectPositions[this.Dragg[0]][0] = this.define_geom_polygon(this.objectPositions[this.Dragg[0]]);
                    //si est un objet provenant du sac
                    if(this.objectPositions[this.Dragg[0]][5] == 1){
                        var temp = this.conversionCoordToGrid_round1(this.objectPositions[this.Dragg[0]][2][0], this.objectPositions[this.Dragg[0]][2][1]);
                        temp = this.placeObjectInGrid(this.objectPositions[this.Dragg[0]][1], temp[0], temp[1]);
                        temp.forEach(element => {
                            this.grid_fonctionnel[element[1]][element[0]] = this.objets[this.objectPositions[this.Dragg[0]][7]][9];
                        });
                    }
                }
                this.previsualiser[0] = false;
                this.previsualiser[1] = [];
                var temp = this.stars.length
                for (let i = this.stars.length-1; i >= 0; i--) {
                    this.stars[i].destroy();
                    this.stars.splice(i,1);
                }
                console.log(this.grid_fonctionnel);
            }
            this.Dragg[0] = -1;
            this.recherche_suppr_evolution();
            this.recherche_evolution();
            this.affiche_graphics();
            console.log("les objets : ",this.objectPositions)
        });
        this.input.keyboard.on('keydown-R', (event) => {
            if(this.Dragg[0] !== -1){
                console.log('R');
                this.rotateObject();

                this.objectPositions[this.Dragg[0]][2][0] = this.objectPositions[this.Dragg[0]][2][0] - dragStartX
                this.objectPositions[this.Dragg[0]][2][1] = this.objectPositions[this.Dragg[0]][2][1] - dragStartY
                this.objectPositions[this.Dragg[0]][0] = this.define_geom_polygon(this.objectPositions[this.Dragg[0]])

                //même code que pointer move
                this.previsualiser = [true];
                this.previsualiser.push([this.objectPositions[this.Dragg[0]][0], this.objectPositions[this.Dragg[0]][1], this.objectPositions[this.Dragg[0]][2], [0x999999,0x999999],this.objectPositions[this.Dragg[0]][4]]);
                this.previsualiser[1][2] = this.conversionCoordToGrid_round0(this.objectPositions[this.Dragg[0]][2][0], this.objectPositions[this.Dragg[0]][2][1]);
                
                if (this.objectPositions[this.Dragg[0]][1].length % 2 === 0){
                    this.previsualiser[1][2][1] -= 0.5
                }
                if (this.objectPositions[this.Dragg[0]][1][0].length % 2 === 0){
                    this.previsualiser[1][2][0] -= 0.5
                }
                this.previsualiser[1][2] = this.conversionGridToCoord(this.previsualiser[1][2][0], this.previsualiser[1][2][1]);
                this.previsualiser[1][0] = this.define_geom_polygon(this.previsualiser[1]);

                var temp = this.conversionCoordToGrid_round1(this.previsualiser[1][2][0], this.previsualiser[1][2][1]);
                this.define_arcane_shape(this.objets[this.objectPositions[this.Dragg[0]][7]][7][this.objectPositions[this.Dragg[0]][6]], this.previsualiser[1][2]);
                var grid_temp = this.placeObjectInGrid(this.previsualiser[1][1], temp[0], temp[1]);
                this.previsualiser[0] = true;
                grid_temp.forEach(element => {
                    if(element[0] >= 0 && element[0] <= 9 && element[1] >= 0 && element[1] <= 9){
                        if(this.grid_fonctionnel[element[1]][element[0]] !== 0){
                            this.previsualiser[0] = false;
                        }
                    }
                    else if (element[0] >= 13 && element[0] <= 17 && element[1] >= 0 && element[1] <= 4){
                        if(this.grid_fonctionnel[element[1]][element[0]] !== 0){
                            this.previsualiser[0] = false;
                        }
                    }
                    else{
                        this.previsualiser[0] = false;
                    }
                });
                this.affiche_graphics();
            }
        });
        this.input.keyboard.on('keydown-ENTER', (event) => {
            this.create_boutique(3);
            this.recherche_suppr_evolution();
            this.recherche_evolution();
            console.log(this.evolution_actuel)
            this.affiche_graphics();
        });
        console.log("la grille : ", this.grid_fonctionnel)
    }

























    //fonction qui permet de tourner l'objet dragg
    rotateObject() {
        this.objectPositions[this.Dragg[0]][1] = this.tourne(this.objectPositions[this.Dragg[0]][1]);
        var temp = this.objectPositions[this.Dragg[0]][6] + 1;
        if (temp === 4){
            temp = 0;
        }
        this.objectPositions[this.Dragg[0]][0] = this.objets[this.objectPositions[this.Dragg[0]][7]][temp];
        this.objectPositions[this.Dragg[0]][4] = this.objets[this.objectPositions[this.Dragg[0]][7]][temp];
        this.objectPositions[this.Dragg[0]][6] = temp;
    }
    findPolygonCenter(polygon) {
        if (polygon.length === 0) {
            return { x: 0, y: 0 }; // Retourne l'origine si le polygone est vide
        }
    
        const sumX = polygon.reduce((acc, point) => acc + point.x, 0);
        const sumY = polygon.reduce((acc, point) => acc + point.y, 0);
    
        const centerX = sumX / polygon.length;
        const centerY = sumY / polygon.length;
    
        return { x: centerX, y: centerY };
    }
    transformPolygon(positions) {
        const transformedPolygon = positions.map(point => ({
            x: point.x * this.grid_origin[2],
            y: point.y * this.grid_origin[2]
        }));
        return transformedPolygon;
    }
    conversionGridToCoord(x,y){
        return [this.grid_origin[0]+this.grid_origin[2]*x+this.grid_origin[2]/2,this.grid_origin[1]+this.grid_origin[2]*y+this.grid_origin[2]/2]
    }
    conversionGridToCoordOrigin(x){
        return this.grid_origin[2]*x
    }
    conversionCoordToGrid(x,y){
        let X = x - this.grid_origin[0];
        let Y = y - this.grid_origin[1];
                
        x = Math.floor(X / this.grid_origin[2]);
        y = Math.floor(Y / this.grid_origin[2]);
        return [x,y]
    }
    conversionCoordToGrid_round1(x,y){
        let X = x - this.grid_origin[0];
        let Y = y - this.grid_origin[1];
                
        x = (X / this.grid_origin[2]).toFixed(1);
        y = (Y / this.grid_origin[2]).toFixed(1);
        return [x,y]
    }
    conversionCoordToGrid_round0(x,y){
        let X = x - this.grid_origin[0];
        let Y = y - this.grid_origin[1];
                
        x = Math.round(X / this.grid_origin[2]);
        y = Math.round(Y / this.grid_origin[2]);
        return [x,y]
    }

    tourne(tableau) {
        const lignes = tableau.length;
        const colonnes = tableau[0].length;
    
        // Crée un nouveau tableau avec des zéros
        const nouveauTableau = Array.from({ length: colonnes }, () => Array(lignes).fill(0));
    
        for (let i = 0; i < lignes; i++) {
            for (let j = 0; j < colonnes; j++) {
                nouveauTableau[j][lignes - 1 - i] = tableau[i][j];
            }
        }
    
        return nouveauTableau;
    }
    affiche_graphics(){
        this.graphics.clear();
        if(this.previsualiser[0]){
            this.graphics.fillStyle(this.previsualiser[1][3][0]);
            this.graphics.fillPoints(this.previsualiser[1][0].points, true);
            this.graphics.fillStyle(0xffffff);
            this.graphics.fillCircle(this.previsualiser[1][2][0], this.previsualiser[1][2][1], 5);
        }
        for (let a = 0; a < this.objectPositions.length; a++){
            if(this.surbriance[0] == a){
                this.graphics.fillStyle(this.objectPositions[a][3][1]);
            }
            else {
                this.graphics.fillStyle(this.objectPositions[a][3][0]);
            }
            this.graphics.fillPoints(this.objectPositions[a][0].points, true);
            this.graphics.fillStyle(0xffffff);
            this.graphics.fillCircle(this.objectPositions[a][2][0], this.objectPositions[a][2][1], 5);
        }
    }
    //définit un objet Phaser.Geom.Polygon avec un obj
    define_geom_polygon(obj){
        let initialPoints = []
        obj[4].points.forEach(coord => {
            initialPoints.push((obj[2][0] - obj[1][0].length / 2 * this.grid_origin[2]) + coord.x*this.grid_origin[2])
            initialPoints.push((obj[2][1] - obj[1].length / 2 * this.grid_origin[2]) + coord.y*this.grid_origin[2])
        });
        return new Phaser.Geom.Polygon(initialPoints)
    }
    //donne les nouvelles coord d'un shape
    define_arcane_shape(coord_shape,center){
        for (let i = 0; i < this.stars.length; i++) {
            this.stars[i].setPosition(center[0]+coord_shape[i][0]*this.grid_origin[2],center[1]+coord_shape[i][1]*this.grid_origin[2]);
        };
    }
    //donne la place de l'obj dans la grille
    placeObjectInGrid(shape, centerX, centerY) {
        var pos = []
        const shapeWidth = shape[0].length;
        const shapeHeight = shape.length;
    
        const startX = Math.floor(centerX - shapeWidth / 2);
        const startY = Math.floor(centerY - shapeHeight / 2);
        for (let y = 0; y < shapeHeight; y++) {
            for (let x = 0; x < shapeWidth; x++) {
                if (shape[y][x] > 0) {
                    pos.push([startX + x,startY + y]);
                }
            }
        }
        return pos
    }
    //donne la place de tout les obj dans la grille
    placeStarInGrid(shape, centerX, centerY) {
        var pos = []
        for (let i = 0; i < shape.length; i++){
            pos.push([shape[i][0]+centerX,shape[i][1]+centerY])
        };
        return pos
    }
    create_boutique(max){
        var objet_pris = [];
        for (var i = 0; i< max; i++){
            var temp = this.randomBetween(0,this.objets.length-1-this.decalage_create_objet, objet_pris);
            objet_pris.push(temp);
            this.objectPositions.push([this.objets[temp][0],
                this.objets[temp][4],
                [i*this.grid_origin[2]*4+this.grid_origin[0],this.grid_origin[2]*3],
                this.objets[temp][5],
                this.objets[temp][0],
                0,
                0,
                temp]);
        }
        for (let x = 0; x < this.objectPositions.length; x++){
            this.objectPositions[x][0] = this.define_geom_polygon(this.objectPositions[x]);
        }
    }
    create_objet_data(id,pos,rotation){
        var forme = this.objets[id][4]
        for (var i = 0; i< rotation; i++){
            forme = this.tourne(forme);
        }
        this.objectPositions.push([this.objets[id][rotation],
            forme,
            pos,
            this.objets[id][5],
            this.objets[id][rotation],
            1,//il est dans le sac
            rotation,
            id]);
        this.objectPositions[this.objectPositions.length-1][0] = this.define_geom_polygon(this.objectPositions[this.objectPositions.length-1]);
    }
    create_objet_data_evo(id,pos,rotation){
        var forme = this.objets[id][4]
        for (var i = 0; i< rotation; i++){
            forme = this.tourne(forme);
        }
        this.objectPositions.push([this.objets[id][rotation],
            forme,
            pos,
            this.objets[id][5],
            this.objets[id][rotation],
            3,//il est dans le "sac" mais est en dehors
            rotation,
            id]);
        this.objectPositions[this.objectPositions.length-1][0] = this.define_geom_polygon(this.objectPositions[this.objectPositions.length-1]);
    }
    create_objet_visu(id,index){
        this.objectPositions.push([this.objets[id][0],
            this.objets[id][4],
            [this.grid_origin[0]+this.grid_origin[2]*14.5+this.grid_origin[2]*index*2,this.grid_origin[1]+this.grid_origin[2]*8],
            this.objets[id][5],
            this.objets[id][0],
            2,
            0,
            id]);
    }
    randomBetween(min, max, objet_pris) { // min and max included 
        var chiffre = Math.floor(Math.random() * (max - min + 1) + min);
        while (objet_pris.includes(chiffre)){
            chiffre = Math.floor(Math.random() * (max - min + 1) + min);
        }
        return chiffre
    }
    //recherche toutes les évolutions, avec tout leurs ingrédients et dessine toutes leurs lignes
    recherche_evolution(){
        var objet_id = []
        var objet_objet_id = []
        for (let i = 0; i < this.objectPositions.length; i++){
            objet_id.push(this.objectPositions[i][7]);
            objet_objet_id.push(i);
        }
        this.evolution.forEach(evo => {
            var tout_objet = [[],[]] //premier ingrédient, 2ème ingrédient
            //si on trouve l'évolution dans les objets
            if(objet_id.includes(evo[0]) && objet_id.includes(evo[1])){
                //on recherche tout les objets et on les stock de chaques coté de l'évolution
                objet_objet_id.forEach(id =>{
                    if(this.objectPositions[id][7] === evo[0]){
                        tout_objet[0].push([id]); //on y stockera toutes les lignes de cet objet, avec les points intermédiaires
                    }
                    else if (this.objectPositions[id][7] === evo[1]){
                        tout_objet[1].push([id]);
                    }
                });
                for (let id_right = 0; id_right < tout_objet[0].length; id_right++){
                    for (let id_left = 0; id_left < tout_objet[1].length; id_left++){
                        const point = this.calculate_lane(this.objectPositions[tout_objet[0][id_right][0]][2],this.objectPositions[tout_objet[1][id_left][0]][2]);
                        tout_objet[0][id_right].push(
                            this.add.line(this.objectPositions[tout_objet[0][id_right][0]][2][0],this.objectPositions[tout_objet[0][id_right][0]][2][1],0,0,point[0],point[1],0xffffff,0.5))
                    }
                }
                for (let id_left = 0; id_left < tout_objet[1].length; id_left++){
                    for (let id_right = 0; id_right < tout_objet[0].length; id_right++){
                        const point = this.calculate_lane(this.objectPositions[tout_objet[1][id_left][0]][2],this.objectPositions[tout_objet[0][id_right][0]][2]);
                        tout_objet[1][id_left].push(
                            this.add.line(this.objectPositions[tout_objet[1][id_left][0]][2][0],this.objectPositions[tout_objet[1][id_left][0]][2][1],0,0,point[0],point[1],0xffffff,0.5))
                    }
                }
                this.evolution_actuel.push([evo[0],evo[1],evo[2], tout_objet]);

                var objet_trouve = false
                this.objectPositions.forEach(obj => {
                    if(evo[2] === obj[7] && obj[5] === 2){
                        objet_trouve = true;
                    }
                });
                //si l'objet de visualisation n'est pas créer
                if(!objet_trouve){
                    //on créer et met à jour l'objet d'évolution
                    this.create_objet_visu(evo[2],this.evolution_actuel.length-1);
                    this.objectPositions[this.objectPositions.length-1][0] = this.define_geom_polygon(this.objectPositions[this.objectPositions.length-1])
                }
            }
        });
    }
    //met à jour les lignes directrices des évolutions
    draw_evolution_lane(){
        var objet_id = []
        this.objectPositions.forEach(obj => {
            objet_id.push(obj[7]);
        });
        //si l'objet de craft à été suppr alors on le retire
        // for (let i = 0; i < this.evolution_actuel.length; i++){
        //     if(!objet_id.includes(this.evolution_actuel[i][0]) || !objet_id.includes(this.evolution_actuel[i][1])){
        //         this.evolution_actuel[i][3].destroy();
        //         this.evolution_actuel[i][4].destroy();
        //         this.evolution_actuel.splice(i,1);
        //     }
        // }

        this.evolution_actuel.forEach(evo => {
            for (let id_right = 0; id_right < evo[3][0].length; id_right++){
                //on suppr toutes les lignes de l'objet vers les ingrédient 2 de l'évo
                for (let id_cible = 1; id_cible < evo[3][0][id_right].length; id_cible++){
                    evo[3][0][id_right][id_cible].destroy();
                    evo[3][0][id_right].splice(id_cible,1);
                }
                //on rajoute toutes les lignes vers les ingrédients 2 de l'évo
                for (let id_left = 0; id_left < evo[3][1].length; id_left++){
                    const point = this.calculate_lane(this.objectPositions[evo[3][0][id_right][0]][2],this.objectPositions[evo[3][1][id_left][0]][2]);
                    evo[3][0][id_right].push(
                        this.add.line(this.objectPositions[evo[3][0][id_right][0]][2][0],this.objectPositions[evo[3][0][id_right][0]][2][1],0,0,point[0],point[1],0xffffff,0.5))
                }
            }
            for (let id_left = 0; id_left < evo[3][1].length; id_left++){
                //on suppr toutes les lignes de l'objet vers les ingrédient 1 de l'évo
                for (let id_cible = 1; id_cible < evo[3][1][id_left].length; id_cible++){
                    evo[3][1][id_left][id_cible].destroy();
                    evo[3][1][id_left].splice(id_cible,1);
                }
                //on rajoute toutes les lignes vers les ingrédients 1 de l'évo
                for (let id_right = 0; id_right < evo[3][0].length; id_right++){
                    const point = this.calculate_lane(this.objectPositions[evo[3][1][id_left][0]][2],this.objectPositions[evo[3][0][id_right][0]][2]);
                    evo[3][1][id_left].push(
                        this.add.line(this.objectPositions[evo[3][1][id_left][0]][2][0],this.objectPositions[evo[3][1][id_left][0]][2][1],0,0,point[0],point[1],0xffffff,0.5))
                }
            }
        })
    }
    //peut supprimer une evolution actuel ou quelques ingrédients
    recherche_suppr_evolution(){
        var objet_id = []
        this.objectPositions.forEach(obj => {
            objet_id.push(obj[7]);
        });
        //on suppr tout
        for (let id_evo = 0; id_evo < this.evolution_actuel.length; id_evo++){
            for (let id_right = 0; id_right < this.evolution_actuel[id_evo][3][0].length; id_right++){
                //on suppr toutes les lignes de l'objet vers les ingrédient 2 de l'évo
                for (let id_cible = 1; id_cible < this.evolution_actuel[id_evo][3][0][id_right].length; id_cible++){
                    this.evolution_actuel[id_evo][3][0][id_right][id_cible].destroy();
                }
            }
            for (let id_left = 0; id_left < this.evolution_actuel[id_evo][3][1].length; id_left++){
                //on suppr toutes les lignes de l'objet vers les ingrédient 1 de l'évo
                for (let id_cible = 1; id_cible < this.evolution_actuel[id_evo][3][1][id_left].length; id_cible++){
                    this.evolution_actuel[id_evo][3][1][id_left][id_cible].destroy();
                }
            }

            //on suppr l'objet de visualisation
            for (let id_obj = this.objectPositions.length-1; id_obj >= 0; id_obj--){
                if(this.evolution_actuel[id_evo][2] === this.objectPositions[id_obj][7] && this.objectPositions[id_obj][5] === 2){
                    this.objectPositions.splice(id_obj,1)
                }
            }
            this.evolution_actuel.splice(id_evo,1)
        }
    }
    calculate_lane(A,B){
        const intermediatePoint = [(B[0]+1000-(A[0]+1000))/5,(B[1]+1000-(A[1]+1000))/5];
        return intermediatePoint
    }
    calculateDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
    NumberinArray(target, array){
        /* Caching array.length doesn't increase the performance of the for loop on V8 (and probably on most of other major engines) */
        for(var i = 0; i < array.length; i++) 
        {
            if(array[i] === target)
            {
            return true;
            }
        }

        return false; 
    }
    ArrayinArray(array1, array2){
        /* if array1 in array2 */
        var match = 0
        for(var i = 0; i < array1.length; i++) 
        {
            for(var t = 0; t < array2.length; t++)
            {
                if(array1[i] === array2[t]){
                    match ++;
                }
            }
        }
        if(match === array1.length){
            return true;
        }
        return false; 
    }
    DataExport(){
        var toutForme = []
        var objetPasPris = []
        for (let i = 0; i < this.objectPositions.length; i++){
            //le status 3 est spécial, si le joueur ne l'a pas pris alors il n'est pas aussi pris en compte et est suppr
            if(this.objectPositions[i][5] === 3){
                objetPasPris.push(i)
            }
            var coord = this.conversionCoordToGrid_round0(this.objectPositions[i][2][0],this.objectPositions[i][2][1]);
            if (this.objectPositions[i][1].length % 2 === 0){
                coord[1] -= 0.5
            }
            if (this.objectPositions[i][1][0].length % 2 === 0){
                coord[0] -= 0.5
            }
            toutForme.push(this.placeObjectInGrid(this.objectPositions[i][1],coord[0],coord[1]));
            var lesStars = this.placeStarInGrid(this.objets[this.objectPositions[i][7]][7][this.objectPositions[i][6]],coord[0],coord[1])
            var nbrStarsValide = 0

            for (let t = 0; t < lesStars.length; t++){
                if(lesStars[t][0] >= 0 && lesStars[t][0] <= 9 && lesStars[t][1] >= 0 && lesStars[t][1] <= 9){
                    if(this.ArrayinArray(this.objets[this.objectPositions[i][7]][8],this.grid_fonctionnel[lesStars[t][1]][lesStars[t][0]])){
                        nbrStarsValide ++;
                    }
                    else if (this.objets[this.objectPositions[i][7]][8] === 1 && this.grid_fonctionnel[lesStars[t][1]][lesStars[t][0]] !== 0 && this.grid_fonctionnel[lesStars[t][1]][lesStars[t][0]] !== -1){
                        nbrStarsValide ++;
                    }
                }
            };
            //true = disparaitra
            //false = reste

            //true = est compte
            //false = n'est pas compte ni dans les evolutions
            if(coord[0] > 9){
                this.objets_bag.push([this.objectPositions[i][7],this.objectPositions[i][2],this.objectPositions[i][6],nbrStarsValide,false, false]);                
            }
            else{
                this.objets_bag.push([this.objectPositions[i][7],this.objectPositions[i][2],this.objectPositions[i][6],nbrStarsValide,false, true]);
            }
        };
        objetPasPris.forEach(id => {
            this.objets_bag.splice(id,1)
        })
        this.evolution_actuel.forEach(evo => {
            //existe définit si il y à l'évolution trouvé (les obj en contact)
            var existe = 0
            evo[3][0].forEach(evo_left => {

                var temp_left = this.conversionCoordToGrid_round1(this.objectPositions[evo_left[0]][2][0], this.objectPositions[evo_left[0]][2][1]);
                var grid_temp_left = this.placeObjectInGrid(this.objectPositions[evo_left[0]][1], temp_left[0], temp_left[1]);
                grid_temp_left.forEach(coord_left => {
                    evo[3][1].forEach(evo_right => {

                        if(this.objets_bag[evo_right[0]][4] === false && this.objets_bag[evo_right[0]][5] === true && this.objets_bag[evo_left[0]][4] === false && this.objets_bag[evo_left[0]][5] === true){
                            var temp_right = this.conversionCoordToGrid_round1(this.objectPositions[evo_right[0]][2][0], this.objectPositions[evo_right[0]][2][1]);
                            var grid_temp_right = this.placeObjectInGrid(this.objectPositions[evo_right[0]][1], temp_right[0], temp_right[1]);
                            grid_temp_right.forEach(coord_right => {
                                if((coord_right[0]-1 === coord_left[0] && coord_right[1] === coord_left[1]) || (coord_right[0]+1 === coord_left[0] && coord_right[1] === coord_left[1]) || (coord_right[1]-1 === coord_left[1] && coord_right[0] === coord_left[0]) || (coord_right[1]+1 === coord_left[1] && coord_right[0] === coord_left[0]) && (this.objets_bag[evo_right[0]][4] === false && this.objets_bag[evo_left[0]][4] === false)){
                                    //les objets de craft vont disparaitres au prochain tour
                                    this.objets_bag[evo_left[0]][4] = true;
                                    this.objets_bag[evo_right[0]][4] = true;
                                    existe ++;

                                    grid_temp_left.forEach(element => {
                                        this.grid_fonctionnel[element[1]][element[0]] = 0;
                                    });

                                    grid_temp_right.forEach(element => {
                                        this.grid_fonctionnel[element[1]][element[0]] = 0;
                                    });
                                }
                            });
                        }
                    });
                });
            })
            //si l'évolution est valide, les derniers objets de objetsposition sont les évolution, donc on le met ici puis on le suppr
            for (let i = 0; i < existe; i++){
                this.objets_evolution.push(this.objets_bag[this.objets_bag.length-1]);
            }
            this.objets_bag.splice(-1,1)
        })
    }
}

export default Bag;