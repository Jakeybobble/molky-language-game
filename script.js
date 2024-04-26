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
            console.log(data);
            //const box = this.boxes.getElementById(data);
            let box = this.boxes.querySelector("#" + data);
            console.log(box);
            if(box) {
                // Detta frigör EventListeners som inte vill tas bort på annat sätt.
                let a = box.cloneNode(true);
                box.remove();
                this.appendChild(a);
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
            phrases = [];
            for(let _c of entries.children) {
                let value = _c.children[0].innerText;
                phrases.push(value);
            }
            //console.log(phrases);
            phrases = phrases.sort((a, b) => 0.5 - Math.random());
            //console.log(phrases);
            setState("game");
        });
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
            this.nextRound();
        });

        this.nextRound();

    }

    nextRound() {
        if(this.round != phrases.length) this.round++;
        
        this.round_counter.innerHTML = this.getRoundString();
        let words = phrases[this.round-1].split(" ");
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

    validate() {

    }

    getRoundString() {
        return "Phrase " + (this.round) + "/" + phrases.length;
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
            start.style.display = "block";
            break;
        case "game-setup":
            let game_setup = views.children[1];
            showLoading(() => {
                hideAll();
                game_setup.style.display = "block";
            });
            
            break;
        case "game": {
            let game = views.children[2];
            showLoading(() => {
                hideAll();
                game.style.display = "block";
            });
        }
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