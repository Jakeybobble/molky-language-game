/// Custom elements ///

customElements.define(
    "drop-box",
    class extends HTMLElement {
        constructor() {
            super();
            let template = document.getElementById("drop-box");
            let templateContent = template.content;
            
            const shadowRoot = this.attachShadow({
                mode: "open"
            });
            shadowRoot.appendChild(templateContent.cloneNode(true));

        }
        
        connectedCallback() {
            this.shadowRoot.getElementById("box").addEventListener("drop", (event) => this._dropEvent(event));
            this.shadowRoot.getElementById("box").addEventListener("dragover", (event) => this._dragoverEvent(event));
        }

        _dropEvent(event) {
            event.preventDefault();
            let data = event.dataTransfer.getData("text");
            const box = document.getElementById(data);
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
            this.shadowRoot.getElementById("box").removeEventListener("drop", this._dropEvent).removeEventListener("dragover", this._dragoverEvent);
        }
        
    },
);

customElements.define(
    "draggable-box",
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

    enable() {
        console.log("Enabling very real loading screen.");
        let background = this.shadowRoot.getElementById("loading-background");
        background.style.display = "flex";
        background.style.animation = "show-loading 1s ease";

        setTimeout(() => {
            // Start game loop
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

/// Other code. ///

function showLoading() {
    let loading = document.getElementById("loading-view");
    loading.enable();
}

function startGame() {
    showLoading();
}

function showInfo() {
    console.log("Showing info screen.");
    document.getElementById("info").background.style.display = "flex";
}

function showTutorial() {
    console.log("Showing tutorial screen.");
    document.getElementById("tutorial").background.style.display = "flex";
}