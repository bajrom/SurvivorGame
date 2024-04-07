class Battle extends Phaser.Scene {
    constructor() {
            super('Battle');
        }
        init (data)
        {
            this.objets = data.objets
            this.evolution = data.evolution
            this.grid_fonctionnel = data.grid_fonctionnel
            this.difficulty = data.difficulty
            this.life = data.life
            console.log("difficulty : ",this.difficulty)
        }
        preload() {
            this.children.removeAll();
            this.load.image('ship', 'ressources/image.png');
            this.largeur = window.innerWidth
            this.hauteur = window.innerHeight
            this.centerX = this.largeur/2
            this.centerY = this.hauteur/2
            this.ennemies = []
            this.ennemiesSats = []
            //this.enemyContainer = this.add.container(0, 0);
            this.player
            this.pos = -1
            this.pos_circle
            this.life_text = this.add.text(100, 50, this.life, {fill: '#ff0000',fontSize: '50px', fontFamily: 'Andale Mono'})
            this.time = 45
            this.time_text = this.add.text(this.largeur-50, 50, this.time, {fill: '#ffffff',fontSize: '24px', fontFamily: 'Andale Mono'})
            this.time_loop = null;
            this.mana = 200
            this.mana_progress = this.add.rectangle(this.largeur/2, this.hauteur-25, 400, 25, 0x00ffff).setDepth(1);
            this.mana_loop = null;
            this.armes = []
            this.effects = []
        }
        create() {
            // Collision categories
            this.playerCategory = this.matter.world.nextCategory();
            this.enemyCategory = this.matter.world.nextCategory();

            this.player = this.matter.add.image(this.centerX, this.centerY, 'ship', null, { isStatic: true }).setScale(0.05);
            this.player.setCollisionCategory(this.playerCategory);
            this.player.setCollidesWith(this.enemyCategory);
            this.player.setDataEnabled();

            this.add.text(50, 50, 'life : ', {fill: '#ffffff',fontSize: '24px', fontFamily: 'Andale Mono'})
            this.add.text(this.largeur-100, 50, 'time', {fill: '#ffffff',fontSize: '24px', fontFamily: 'Andale Mono'})
            this.add.text(this.largeur/2, this.hauteur-75, 'mana', {fill: '#ffffff',fontSize: '24px', fontFamily: 'Andale Mono'})
            //background du mana bar
            this.add.rectangle(this.largeur/2, this.hauteur-25, 410, 30, 0x808080).setAlpha(0.5).setDepth(0);

            this.effects.push({id:0,count:0});
            //on créer les armes et les effet (bonus, malus) qui cumuls
            for (let i = 0; i < this.objets.length; i++){
                if(this.objets[i][5]){
                    switch (this.objets[i][0]){
                        case 0:
                            this.effects[0].count ++;
                            break;
                        case 1:
                            this.armes.push({id:1, dmg: 100, cld:5, mana:10, bonus:this.objets[i][3]*35, obj:false, loop:0});
                            break;
                        case 2:
                            this.armes.push({id:2, dmg: 50, cld:5, mana:10, bonus:(50)-8*this.objets[i][3], obj:false, loop:0});
                            break;
                        case 4:
                            this.armes.push({id:4, dmg: 80, cld:5, mana:10, bonus:50, obj:false, loop:0});
                            break;
                    }
                }
            }

            for (let i = 0; i < 10+this.difficulty; i++){
                this.create_ennemie()
            }
            
            this.input.on('pointermove', (pointer) => {
                if(this.pos === -1){
                    this.player.setAngle(this.calculateAnglePointToPoint(this.centerX, this.centerY, pointer.x, pointer.y));
                }
            });
            
            this.input.keyboard.on('keydown-ENTER', (event) => {
                    //on clear toutes les armes
                    this.armes.forEach(arme => {
                        clearInterval(arme.loop);
                    });
                    clearInterval(this.time_loop);
                    clearInterval(this.mana_loop);
                this.scene.start('Bag', {objets:this.objets, evolution:this.evolution, grid_fonctionnel:this.grid_fonctionnel, difficulty:this.difficulty, life:this.life})
            })
            this.input.on('pointerdown', pointer =>{
                if(this.pos !== -1){
                    this.pos = -1
                    this.pos_circle.destroy();
                }

                let angleDegrees = this.calculateAnglePointToPoint(this.centerX, this.centerY, pointer.x, pointer.y)
                this.pos = [pointer.x,pointer.y,this.calculateForceBodyToPoint(this.player.x,this.player.y,pointer.x,pointer.y),angleDegrees]
                this.player.setAngle(this.pos[3]);

                this.pos_circle = this.add.circle(this.pos[0], this.pos[1], 5, 0xffffff);
            })

            for (let i = 0; i < this.armes.length; i++){
                switch(this.armes[i].id){
                    case 1:
                        //on le délchenche une première fois avant d'attendre et pour initialiser
                        setTimeout(() => {
                            if(this.mana-this.armes[i].mana >= 0){
                                this.armes[i].obj = this.add.rectangle(this.centerX,this.centerY, 500*(1+this.armes[i].bonus/100), 100, 0x00ff00).setDepth(0);
                                this.mana -= this.armes[i].mana
                                this.updateMana(this.mana)

                                for (let t = 0; t < this.ennemies.length; t++){
                                    //les ennemies touché
                                    if (Phaser.Geom.Rectangle.Contains(this.armes[i].obj.getBounds(), this.ennemies[t].x, this.ennemies[t].y)) {
                                        this.ennemie_dmg(t,this.armes[i].dmg)
                                    }
                                };

                                const tween = this.tweens.add({
                                    targets: this.armes[i].obj,
                                    alpha: 0,
                                    duration: 1000,
                                    ease: Phaser.Math.Easing.Linear
                                });
                            }

                            //puis la boucle
                            this.armes[i].loop = setInterval(() => {
                                if(this.mana-this.armes[i].mana >= 0){
                                    this.armes[i].obj.setAlpha(1);
                                    this.mana -= this.armes[i].mana
                                    this.updateMana(this.mana)
                        
                                    for (let t = 0; t < this.ennemies.length; t++){
                                        //les ennemies touché
                                        if (Phaser.Geom.Rectangle.Contains(this.armes[i].obj.getBounds(), this.ennemies[t].x, this.ennemies[t].y)) {
                                            this.ennemie_dmg(t,this.armes[i].dmg)
                                        }
                                    };
                                    const tween = this.tweens.add({
                                        targets: this.armes[i].obj,
                                        alpha: 0,
                                        duration: 1000,
                                        ease: Phaser.Math.Easing.Linear
                                    });
                                }
                            }, this.armes[i].cld*1000)
                        },i*500);
                        break;
                    case 2:
                        //on le délchenche une première fois avant d'attendre et pour initialiser
                        setTimeout(() => {
                            if(this.mana-this.armes[i].mana >= 0){
                                this.mana -= this.armes[i].mana;
                                this.updateMana(this.mana);
                                this.weaponEffectTransmit(this.armes[i].dmg,this.armes[i].bonus);
                            }

                            //puis la boucle
                            this.armes[i].loop = setInterval(() => {
                                if(this.mana-this.armes[i].mana >= 0){
                                    this.mana -= this.armes[i].mana
                                    this.updateMana(this.mana)
                                    this.weaponEffectTransmit(this.armes[i].dmg,this.armes[i].bonus);
                                }
                            }, this.armes[i].cld*1000)
                        },i*500);
                        break;
                    case 4:
                        //on le délchenche une première fois avant d'attendre et pour initialiser
                        setTimeout(() => {
                            if(this.mana-this.armes[i].mana >= 0){
                                this.mana -= this.armes[i].mana;
                                this.updateMana(this.mana);
                                this.weaponEffectTransmitEvo(this.armes[i].dmg);
                            }
    
                            //puis la boucle
                            this.armes[i].loop = setInterval(() => {
                                if(this.mana-this.armes[i].mana >= 0){
                                    this.mana -= this.armes[i].mana
                                    this.updateMana(this.mana)
                                    this.weaponEffectTransmitEvo(this.armes[i].dmg);
                                }
                            }, this.armes[i].cld*1000)
                        },i*500);
                        break;
                }
            }

            this.matter.world.on('collisionstart', (event, bodyA, bodyB) => {
                var idbodyB = this.find_near_ennemie(bodyB.position.x,bodyB.position.y)
                //si collision avec le player
                if(bodyA.position.x == this.centerX && bodyA.position.y == this.centerY){
                    this.replace_ennemie(idbodyB);
                    this.life -= this.ennemiesSats[idbodyB].dmg;
                    this.life_text.setText(this.life);
                }
            });

            //timer
            this.time_loop = setInterval(() => {
                if(this.time <= 0){
                    //on clear toutes les armes
                    this.armes.forEach(arme => {
                        clearInterval(arme.loop);
                    });
                    clearInterval(this.time_loop);
                    clearInterval(this.mana_loop);
                    this.scene.start('Bag', {objets:this.objets, evolution:this.evolution, grid_fonctionnel:this.grid_fonctionnel, difficulty:this.difficulty, life:this.life})
                }
                this.time --;
                this.time_text.setText(this.time);
            },1000)

            //mana
            this.mana_loop = setInterval(() => {
                if(this.mana < 200){
                    this.mana ++;
                    this.updateMana(this.mana)
                }
            },200)
        }
        update(time, delta) {
            if(this.pos !== -1){
                for (let i = 0; i < this.ennemies.length; i++){
                    const force = this.calculateForceToCenter(this.ennemies[i]);
                    //décalage énnemies quand on se déplace
                    force.x -= this.pos[2].x;
                    force.y -= this.pos[2].y;
                    this.ennemies[i].x += force.x;
                    this.ennemies[i].y += force.y;
                    this.ennemies[i].setAngle(180+this.calculateAnglePointToPoint(this.ennemies[i].x,this.ennemies[i].y,this.centerX,this.centerY));
                    //quand l'ennemie est en dehors
                    if(this.ennemies[i].x < -40 || this.ennemies[i].x > this.largeur + 40 || this.ennemies[i].y < -40 || this.ennemies[i].y > this.hauteur + 40){
                        this.replace_ennemie(i);
                    }
                };
                //décalage du point de direction
                this.pos[0] -= this.pos[2].x;
                this.pos[1] -= this.pos[2].y;
                this.pos_circle.x = this.pos[0];
                this.pos_circle.y = this.pos[1];
                if(this.matter.containsPoint(this.player, this.pos[0], this.pos[1])){
                    this.pos = -1
                    this.pos_circle.destroy();
                }
            }
            else{
                for (let i = 0; i < this.ennemies.length; i++){
                    const force = this.calculateForceToCenter(this.ennemies[i]);
                    this.ennemies[i].x += force.x;
                    this.ennemies[i].y += force.y;
                    this.ennemies[i].setAngle(180+this.calculateAnglePointToPoint(this.ennemies[i].x,this.ennemies[i].y,this.centerX,this.centerY));
                    //quand l'ennemie est en dehors
                    if(this.ennemies[i].x < -40 || this.ennemies[i].x > this.largeur + 40 || this.ennemies[i].y < -40 || this.ennemies[i].y > this.hauteur + 40){
                        this.replace_ennemie(i);
                    }
                };
            }
        }
        find_near_ennemie(x,y){
            //initialisation
            let nearest = this.calculateDistance(x,y,this.ennemies[0].x,this.ennemies[0].y)
            let idChose = 0
            //recherche pour chaque ennemie la distance la plus courte
            for (let i = 0; i < this.ennemies.length; i++){
                let temp = this.calculateDistance(x,y,this.ennemies[i].x,this.ennemies[i].y)
                if(temp < nearest){
                    nearest = temp;
                    idChose = i;
                }
            }
            return idChose
        }
        find_near_ennemie_blackList(x,y,blackList){
            //initialisation
            let nearest = 5000
            let idChose = null
            //recherche pour chaque ennemie la distance la plus courte
            for (let i = 0; i < this.ennemies.length; i++){
                let temp = this.calculateDistance(x,y,this.ennemies[i].x,this.ennemies[i].y)
                if(temp < nearest && !blackList.includes(i)){
                    nearest = temp;
                    idChose = i;
                }
            }
            return idChose
        }
        
        create_ennemie(){
            var cote = this.randomBetween(0,3);
            var x_ennemie = this.randomBetween(0,this.largeur);
            var y_ennemie = this.randomBetween(0,this.hauteur);
            switch (cote){
                case 0:
                    x_ennemie = - 20;
                    break;
                case 1:
                    x_ennemie = this.largeur + 20;
                    break;
                case 2:
                    y_ennemie = - 20;
                    break;
                case 3:
                    y_ennemie = this.hauteur + 20;
                    break;
            }
            const chevron = '25 0 18.75 12.5 25 25 6.25 25 0 12.5 6.25 0';
            var temp = this.add.polygon(x_ennemie, y_ennemie, chevron, 0xff0000, 0.5);
            var temp2 = this.matter.add.gameObject(temp, { shape: { type: 'fromVerts', verts: chevron, flagInternal: true } });

            temp2.setCollisionCategory(this.enemyCategory);
            temp2.setCollidesWith([this.playerCategory,this.enemyCategory]);

            this.ennemies.push(temp2);

            this.ennemiesSats.push({pv:95+this.difficulty*5,dmg:this.difficulty+1})
        }
        replace_ennemie(i){
            var cote = this.randomBetween(0,3);
            var x_ennemie = this.randomBetween(0,this.largeur);
            var y_ennemie = this.randomBetween(0,this.hauteur);
            switch (cote){
                case 0:
                    x_ennemie = - 20;
                    break;
                case 1:
                    x_ennemie = this.largeur + 20;
                    break;
                case 2:
                    y_ennemie = - 20;
                    break;
                case 3:
                    y_ennemie = this.hauteur + 20;
                    break;
            }
            const chevron = '25 0 18.75 12.5 25 25 6.25 25 0 12.5 6.25 0';
            var temp = this.add.polygon(x_ennemie, y_ennemie, chevron, 0xff0000, 0.5);
            var temp2 = this.matter.add.gameObject(temp, { shape: { type: 'fromVerts', verts: chevron, flagInternal: true } });

            temp2.setCollisionCategory(this.enemyCategory);
            temp2.setCollidesWith([this.playerCategory,this.enemyCategory]);

            this.ennemies[i].destroy();
            this.ennemies[i] = temp2;
            this.ennemiesSats[i] = {pv:95+this.difficulty*5,dmg:this.difficulty+1};
        }
        ennemie_dmg(t,dmg){
            this.ennemiesSats[t].pv -= dmg

            if(this.ennemiesSats[t].pv < 0){
                dmg = this.ennemiesSats[t].pv + dmg
            }
            // display les dmg pris
            const damageText = this.add.text(this.ennemies[t].x, this.ennemies[t].y, `-${dmg}`, { 
                fill: '#ff0000', 
                fontSize: `${10+dmg/10}px`, 
                fontFamily: 'Arial' 
            });
            // petit mouvement du txt
            var cote = this.randomBetween(0,3);
            let moveX = Phaser.Math.Between(-50, 50);
            let moveY = Phaser.Math.Between(-50, 50);
            switch (cote){
                case 0:
                    moveX = -50;
                    break;
                case 1:
                    moveX = 50;
                    break;
                case 2:
                    moveY = -50;
                    break;
                case 3:
                    moveY = 50;
                    break;
            }
            this.tweens.add({
                targets: damageText,
                x: damageText.x + moveX,
                y: damageText.y + moveY,
                duration: 1500,
                ease: 'Quint.out',
                //on suppr après 1.5s
                onComplete: () => {
                    damageText.destroy();
                }
            });

            if(this.ennemiesSats[t].pv <= 0){
                this.ennemie_death(t);
                return true;
            }
            else{
                return false;
            }
        }
        ennemie_death(t){
            this.life += this.effects[0].count;
            if(this.life > 100){
                this.life = 100
            }
            this.life_text.setText(this.life);
            this.replace_ennemie(t);
        }
        calculateForceToCenter(body) {
            const direction = {
                x: this.centerX - body.x,
                y: this.centerY - body.y
            };
            
            // Normalize the direction
            const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
            const normalizedDirection = {
                x: direction.x / length,
                y: direction.y / length
            };
        
            // Scale the normalized direction to desired force
            const forceMagnitude = 1; // Adjust this value for the desired force
            const force = {
                x: normalizedDirection.x * forceMagnitude,
                y: normalizedDirection.y * forceMagnitude
            };
        
            return force;
        }
        calculateForceBodyToPoint(x1,y1,x2,y2) {
            const direction = {
                x: x2 - x1,
                y: y2 - y1
            };
            
            // Normalize the direction
            const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
            const normalizedDirection = {
                x: direction.x / length,
                y: direction.y / length
            };
        
            // Scale the normalized direction to desired force
            const forceMagnitude = 1.8; // Adjust this value for the desired force
            const force = {
                x: normalizedDirection.x * forceMagnitude,
                y: normalizedDirection.y * forceMagnitude
            };
        
            return force;
        }
        calculateAnglePointToPoint(x1,y1,x2,y2){
            // Calculate the angle in radians
            var angleRadians = Phaser.Math.Angle.Between(x1, y1, x2, y2);
            
            // Convert radians to degrees
            return Phaser.Math.RadToDeg(angleRadians);
        }
        calculateDistance(x1, y1, x2, y2) {
            // Calculate the difference in x and y coordinates
            const dx = x2 - x1;
            const dy = y2 - y1;
        
            // Use Pythagorean theorem to calculate distance
            return Math.sqrt(dx * dx + dy * dy);
        }
        updateMana(mana){
            this.mana_progress.width = mana*2;
        }
        randomBetween(min, max) { // min and max included 
            return Math.floor(Math.random() * (max - min + 1) + min);
        }
        weaponEffectTransmit(dmg,bonus){
            let tabLignes = []
            let blackListEnnemies = []

            let idEnnemie = this.find_near_ennemie(this.player.x,this.player.y);
            tabLignes.push(idEnnemie)
            blackListEnnemies.push(idEnnemie)

            let line = this.add.line(0, 0, this.player.x, this.player.y, this.ennemies[idEnnemie].x, this.ennemies[idEnnemie].y, 0xffffff);
            setTimeout(() => {
                line.destroy();
            },180)

            this.ennemie_dmg(idEnnemie,dmg);
            dmg = Math.floor(dmg*(1-bonus/100));

            //doit juste chercher les obj pour faire une chaine
            while(idEnnemie != null){
                idEnnemie = this.find_near_ennemie_blackList(this.ennemies[idEnnemie].x,this.ennemies[idEnnemie].y,blackListEnnemies);
                if(idEnnemie != null){
                    tabLignes.push(idEnnemie)
                    blackListEnnemies.push(idEnnemie)
                }
            }
            //puis on applique les degats sur la chaine dennemies
            for (let t = 1; t < tabLignes.length; t++){
                setTimeout(() => {
                    if(dmg > 0){
                        line = this.add.line(0, 0, this.ennemies[tabLignes[t-1]].x, this.ennemies[tabLignes[t-1]].y, this.ennemies[tabLignes[t]].x, this.ennemies[tabLignes[t]].y, 0xffffff);
                        this.ennemie_dmg(tabLignes[t],dmg);
                        dmg = Math.floor(dmg*(1-bonus/100));

                        setTimeout(() => {
                            line.destroy();
                        },180)
                    }
                },t*200)
            }
        }
        weaponEffectTransmitEvo(dmg){
            let tabLignes = []
            let blackListEnnemies = []

            let idEnnemie = this.find_near_ennemie(this.player.x,this.player.y);
            tabLignes.push(idEnnemie)
            blackListEnnemies.push(idEnnemie)

            let line = this.add.line(0, 0, this.player.x, this.player.y, this.ennemies[idEnnemie].x, this.ennemies[idEnnemie].y, 0xffffff);
            setTimeout(() => {
                line.destroy();
            },180)

            if(!this.ennemie_dmg(idEnnemie,dmg)){
                dmg = Math.floor(dmg*0.5);
            }

            //doit juste chercher les obj pour faire une chaine
            while(idEnnemie != null){
                idEnnemie = this.find_near_ennemie_blackList(this.ennemies[idEnnemie].x,this.ennemies[idEnnemie].y,blackListEnnemies);
                if(idEnnemie != null){
                    tabLignes.push(idEnnemie)
                    blackListEnnemies.push(idEnnemie)
                }
            }

            //puis on applique les degats sur la chaine dennemies
            for (let t = 1; t < tabLignes.length; t++){
                setTimeout(() => {
                    if(dmg > 0){

                        line = this.add.line(0, 0, this.ennemies[tabLignes[t-1]].x, this.ennemies[tabLignes[t-1]].y, this.ennemies[tabLignes[t]].x, this.ennemies[tabLignes[t]].y, 0xffffff);
                        if(!this.ennemie_dmg(tabLignes[t],dmg)){
                            dmg = Math.floor(dmg*0.5);
                        }
                        setTimeout(() => {
                            line.destroy();
                        },180)
                    }
                },t*200)
            }
        }
    }
    export default Battle;