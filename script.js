/// Custom elements ///

customElements.define("drop-box",
    class extends HTMLElement {
        constructor() {
            super();
            let template = document.getElementById("drop-box");
            let templateContent = template.content;
            
            const shadowRoot = this.attachShadow({
                mode: "open"
            });
            shadowRoot.appendChild(templateContent.cloneNode(true));

            this.shadowRoot.getElementById("box").addEventListener("drop", (event) => this._dropEvent(event));
            this.shadowRoot.getElementById("box").addEventListener("dragover", (event) => this._dragoverEvent(event));

            

        }
        
        connectedCallback() {
            const game = document.querySelector("view-game");
            this.boxes = game.shadowRoot.getElementById("boxes");

        }

        _dropEvent(event) {
            event.preventDefault();

            let data = event.dataTransfer.getData("text");
            let box = this.boxes.querySelector("#" + data);

            let current_box = this.children[0];
            if(box) { // Make sure no phantom draggables are being dragged...
                if(current_box == null) {
                    let a = box.cloneNode(true);
                    box.remove();
                    this.appendChild(a);
                } else {
                    let other_parent = box.parentElement;
                    let send_box = current_box.cloneNode(true);
                    let receive_box = box.cloneNode(true);
                    current_box.remove();
                    box.remove();
                    this.appendChild(receive_box);
                    other_parent.appendChild(send_box);
                }
                
            }
            
            
        }

        _dragoverEvent(event) {
            event.preventDefault();
        }

        disconnectedCallback() {
            //this.shadowRoot.getElementById("box").removeEventListener("drop", this._dropEvent).removeEventListener("dragover", this._dragoverEvent);
        }
        
    },
);

customElements.define("draggable-box",
    class extends HTMLElement {
        constructor() {
            super();
            let template = document.getElementById("draggable-box");
            let templateContent = template.content;

            const shadowRoot = this.attachShadow({
                mode: "open"
            });
            shadowRoot.appendChild(templateContent.cloneNode(true));
            
            this._dragstartEvent.bind(this);
            this.shadowRoot.getElementById("draggable").addEventListener("dragstart", (event) => this._dragstartEvent(event));
        }

        _dragstartEvent(ev) {
            ev.dataTransfer.setData("text", this.getAttribute("id"));
        }
        // Annars skulle connectedCallback() och disconnectedCallback() finnas här,
        // men vi återskapar istället objektet varje gång.
    }
);

customElements.define("view-start", class extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(document.getElementById("view-start").content.cloneNode(true));

        /*
        this.info_button = shadowRoot.getElementById("info-button");
        this.info_button.addEventListener("click", this.showInfo);
        */
    }
});

customElements.define("view-loading", class extends HTMLElement {
    constructor() {
        super();

        this.enabled = false;
        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(document.getElementById("view-loading").content.cloneNode(true));
    }

    enable(_function) {
        console.log("Enabling very real loading screen.");
        let background = this.shadowRoot.getElementById("loading-background");
        background.style.display = "flex";
        background.style.animation = "show-loading 1s";

        setTimeout(() => {
            // run _function
            if(_function != null) {
                _function();
            }
        }, 1200);

        setTimeout(() => {
            background.style.animation = "hide-loading 1s ease";
            setTimeout(() => {
                background.style.display = "none";
            }, 900);
        }, 4321);
        
        
    }
});

customElements.define("view-info", class extends HTMLElement {
    constructor() {
        super();

        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(document.getElementById("view-info").content.cloneNode(true));

        this.background = shadowRoot.getElementById("background");
        this.background.addEventListener("click", () => {
            this.background.style.display = "none";
        });

        shadowRoot.getElementById("box").addEventListener("click", function(event) {
            event.stopPropagation();
        });
    }
});

customElements.define("view-game-setup", class extends HTMLElement {
    constructor() {
        super();

        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(document.getElementById("view-game-setup").content.cloneNode(true));

        let button = shadowRoot.getElementById("add-button");
        this.textbox = shadowRoot.getElementById("textbox");
        let start_button = shadowRoot.getElementById("start-button");
        
        button.addEventListener("click", () => {
            this.addEntry(this.textbox.value);
        });

        start_button.addEventListener("click", () => {
            let entries = document.getElementById("entries");
            if(entries.children.length == 0) {
                return;
            }
            phrases = [];
            for(let _c of entries.children) {
                let value = _c.children[0].innerText;
                phrases.push(value);
            }

            this.saveData();

            phrases_scrambled = phrases.sort((a, b) => 0.5 - Math.random());
            setState("game");
        });

        this.loadData();
    }

    loadData() {
        fetch("savedata.json").then((response) => {
            return response.text();
        }).then((data) => {
            let _json = JSON.parse(data);
            for(let _entry of _json["phrases"]) {
                this.addEntry(_entry);
            }
            
        }).catch((error) => {
            console.log(error);
        });
    }

    saveData() {
        // Kan inte spara data eftersom att det skulle kräva node av vad jag förstår.
    }

    addEntry(_input) {
        if(_input.length == 0) return;
        console.log("Adding sentence '" + _input + "'...");
        let entries = document.getElementById("entries");
        let entry = document.createElement("setup-entry");
        let p = document.createElement("p");
        p.innerText = _input;
        p.slot = "text";
        entry.appendChild(p);
        entries.appendChild(entry);
        this.textbox.value = "";

    }
});

let phrases = ["Testing sentence number one.", "This is test number two."];
let phrases_scrambled = [];
let guessed_phrases = [];

customElements.define("setup-entry", class extends HTMLElement {
    constructor() {
        super();

        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(document.getElementById("setup-entry").content.cloneNode(true));

        this.delete_button = shadowRoot.getElementById("delete-button");
        this.delete_button.addEventListener("click", () => {
            this.remove();
        });

    }
});

customElements.define("view-game", class extends HTMLElement {
    constructor() {
        super();
        
        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(document.getElementById("view-game").content.cloneNode(true));

        this.round = 0;
        this.round_counter = shadowRoot.getElementById("round");
        
        this.drop_field = shadowRoot.getElementById("drop-field");
        this.boxes_field = shadowRoot.getElementById("boxes-field");

        this.boxes = this.shadowRoot.getElementById("boxes");

        shadowRoot.getElementById("next-button").addEventListener("click", () => {
            guessed_phrases.push(this.getCompleteString());
            this.nextRound();
        });

        //this.nextRound(); // Only during debug.

    }

    reset() {
        this.round = 0;
    }

    nextRound() {
        if(this.round == phrases_scrambled.length){
            document.getElementById("game-complete").bringForth();
            return;
        }
        this.round++;
        
        this.round_counter.innerHTML = this.getRoundString();
        let words = phrases_scrambled[this.round-1].split(" ");
        words = words.sort((a, b) => 0.5 - Math.random());

        // Clean up
        this.drop_field.innerHTML = '';
        this.boxes_field.innerHTML = '';

        // Create boxes
        let id_num = 0;
        for(let word of words) {
            
            // Create each box in each word thing...
            let box = document.createElement("drop-box");
            this.drop_field.appendChild(box);

            let bottom_box = document.createElement("drop-box");
            let draggable = document.createElement("draggable-box");
            draggable.slot = "box-content";
            draggable.id = "box-" + (id_num++);
            let p = document.createElement("p");
            p.innerText = word;
            p.slot = "text";

            draggable.appendChild(p);
            //bottom_box.appendChild(draggable);
            
            this.boxes_field.appendChild(draggable);
        }
    }

    calculateScore() { 

    }

    getCompleteString() {
        let arr = [];
        for(let box of this.drop_field.children) {
            if(box.children.length != 0){
                arr.push(box.children[0].children[0].innerText);
            }
            
        }
        return arr.join(" ");
    }

    getRoundString() {
        return "Phrase " + (this.round) + "/" + phrases_scrambled.length;
    }
});

customElements.define("view-complete", class extends HTMLElement {
    constructor() {
        super();

        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(document.getElementById("view-complete").content.cloneNode(true));

        shadowRoot.getElementById("restart-button").addEventListener("click", () => {
            setState("game-setup");
        });

    }

    bringForth() {
        console.log("Game complete.");
        setState("game-complete");

        const ul = document.getElementById("error-list");
        ul.innerHTML = ""; // Empty it.

        let errors = 0;
        // Calculate score
        for(let x = 0; x < phrases_scrambled.length; x++) {
            let phrase = phrases_scrambled[x];
            let guessed_phrase = guessed_phrases[x];
            if(phrase != guessed_phrase){
                errors++;

                let li = document.createElement("li");

                li.className = "error-list-item";
                console.log(guessed_phrase);
                li.innerText = `Got ${guessed_phrase == "" ? "empty" : '"'+guessed_phrase+'"'} | Correct: ${phrase}`;

                ul.appendChild(li);
            }
        }
        this.shadowRoot.querySelector("h3").innerText = this.getPhrasesCorrectString(errors);
        let lizard = document.getElementById("lizard");
        lizard.style.display = "none";
        if((phrases_scrambled.length - errors) == phrases_scrambled.length){
            lizard.style.display = "flex";
        }



    }

    getPhrasesCorrectString(errors) {
        let str = `You got ${phrases_scrambled.length - errors} out of ${phrases_scrambled.length} correct${(phrases_scrambled.length - errors) == phrases_scrambled.length ? "!" : "."}`;
        return str;
    }

});

customElements.define("pink-lizard", class extends HTMLElement {
    constructor() {
        super(); const shadowRoot = this.attachShadow({mode: "open" });
        shadowRoot.appendChild(document.getElementById("pink-lizard").content.cloneNode(true));
    }
});

/// Other code. ///

function showLoading(_function) {
    let loading = document.getElementById("loading-view");
    loading.enable(_function);
}

function startGame() {
    // Så rörigt.
    //showLoading();
    setState("game-setup");
}

function showInfo() {
    console.log("Showing info screen.");
    document.getElementById("info").background.style.display = "flex";
}

function showTutorial() {
    console.log("Showing tutorial screen.");
    document.getElementById("tutorial").background.style.display = "flex";
}

// _view: string
function setState(_view) {
    // I am so not proud of this system.
    let views = document.getElementById("views");

    switch(_view){
        case "start":
            hideAll();
            let start = views.children[0];
            start.style.display = "flex";
            break;
        case "game-setup":
            document.getElementById("game").reset();
            let game_setup = views.children[1];
            hideAll();
            game_setup.style.display = "flex";
            
            break;
        case "game":
            let game = views.children[2];
            showLoading(() => {
                hideAll();
                game.style.display = "flex";
                document.getElementById("game").nextRound();
            });
            break;
        case "game-complete":
            let complete = views.children[3];
            showLoading(() => {
                hideAll();
                complete.style.display = "flex";
            });
            break;
    }
}

function hideAll() {
    let views = document.getElementById("views");
    for(let _c of views.children){
        _c.style.display = "none";
    }
}

function onPageLoad() {
    //setState("start");
}