const container = document.querySelector(".container");
const menu = document.querySelector(".menu");
const items = document.querySelectorAll(".item");
let current = 0;
items.forEach((item, i) =>
    item.addEventListener("click", () => {
        if (i < current) {
            // ltr
            container.className = "container right instant";
            void container.offsetHeight; // force reflow
            container.className = `container left pos${i}`;
        } else if (i > current) {
            // rtl
            container.className = "container left instant";
            void container.offsetHeight; // force reflow
            container.className = `container right pos${i}`;
        }
        current = i;
    })
);
