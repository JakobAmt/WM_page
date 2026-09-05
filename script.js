import * as THREE from "three";
import { STLLoader } from "three/addons/loaders/STLLoader.js";


/* =====================================================
   THREE.JS SETUP
===================================================== */

const container = document.getElementById("three-container");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    35,
    container.clientWidth / container.clientHeight,
    0.1,
    100
);

camera.position.set(0, 0, 5);


/* =====================================================
   RENDERER
===================================================== */

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.setSize(
    container.clientWidth,
    container.clientHeight
);

renderer.shadowMap.enabled = true;

container.appendChild(renderer.domElement);


/* =====================================================
   LIGHTING
===================================================== */

const ambientLight = new THREE.AmbientLight(
    0xffffff,
    2
);

scene.add(ambientLight);


const keyLight = new THREE.DirectionalLight(
    0xffffff,
    4
);

keyLight.position.set(3, 4, 5);

scene.add(keyLight);


const fillLight = new THREE.DirectionalLight(
    0xffffff,
    2
);

fillLight.position.set(-4, 1, 2);

scene.add(fillLight);


/* =====================================================
   MODEL
===================================================== */

const loader = new STLLoader();

let model = null;


/*
    Change this number to change the starting
    horizontal orientation of the watch stand.

    Negative = counter-clockwise
    Positive = clockwise
*/

const modelRotationOffset = -1.17;


loader.load(

    "models/watchmate_model.stl",

    (geometry) => {

        geometry.computeVertexNormals();

        /* ---------------------------------------------
           MATERIAL
        --------------------------------------------- */

        const material = new THREE.MeshStandardMaterial({

            color: 0xf4f0df,

            roughness: 0.38,

            metalness: 0.05

        });


        model = new THREE.Mesh(
            geometry,
            material
        );


        /* ---------------------------------------------
           CENTER MODEL
        --------------------------------------------- */

        geometry.computeBoundingBox();

        const box = geometry.boundingBox;

        const center = new THREE.Vector3();

        box.getCenter(center);

        geometry.translate(
            -center.x,
            -center.y,
            -center.z
        );


        /* ---------------------------------------------
           SCALE MODEL
        --------------------------------------------- */

        const size = new THREE.Vector3();

        box.getSize(size);

        const maxDimension = Math.max(
            size.x,
            size.y,
            size.z
        );

        const scale = 2.3 / maxDimension;

        model.scale.setScalar(scale);


        /* ---------------------------------------------
           INITIAL ROTATION
        --------------------------------------------- */

        model.rotation.x = -0.15;

        model.rotation.y = modelRotationOffset;


        /* ---------------------------------------------
           ADD MODEL
        --------------------------------------------- */

        scene.add(model);

    },


    undefined,


    (error) => {

        console.error(
            "Could not load WatchMate STL:",
            error
        );

    }

);


/* =====================================================
   CURSOR
===================================================== */

let mouseX = 0;
let mouseY = 0;

let targetX = 0;
let targetY = 0;


/* Desktop */

window.addEventListener(
    "mousemove",
    (event) => {

        mouseX =
            (event.clientX / window.innerWidth) - 0.5;

        mouseY =
            (event.clientY / window.innerHeight) - 0.5;

    }
);


/* Mobile */

window.addEventListener(
    "touchmove",
    (event) => {

        if (!event.touches.length) {
            return;
        }

        const touch = event.touches[0];

        mouseX =
            (touch.clientX / window.innerWidth) - 0.5;

        mouseY =
            (touch.clientY / window.innerHeight) - 0.5;

    },
    {
        passive: true
    }
);


/* =====================================================
   ANIMATION
===================================================== */

const clock = new THREE.Clock();


function animate() {

    requestAnimationFrame(animate);


    const elapsed =
        clock.getElapsedTime();


    /* ---------------------------------------------
       Smooth cursor movement
    --------------------------------------------- */

    targetX +=
        (mouseX - targetX) * 0.04;

    targetY +=
        (mouseY - targetY) * 0.04;


    /* ---------------------------------------------
       MODEL
    --------------------------------------------- */

    if (model) {

        /*
            Slow continuous rotation.

            This makes the stand slowly rotate even
            when the user isn't doing anything.
        */

        const baseRotation =
            elapsed * 0.15;


        /*
            Cursor influence.

            Move the mouse left/right → rotate around Y
            Move the mouse up/down → tilt around X
        */

        const cursorRotationY =
            targetX * 0.45;

        const cursorRotationX =
            targetY * 0.25;


        /*
            Combine everything.

            Offset = initial orientation
            Base = automatic rotation
            Cursor = interactive rotation
        */

        model.rotation.y =
            modelRotationOffset +
            baseRotation +
            cursorRotationY;


        model.rotation.x =
            -0.15 +
            cursorRotationX;


        /*
            Gentle floating movement
        */

        model.position.y =
            Math.sin(elapsed * 1.2) * 0.08;

    }


    /* ---------------------------------------------
       Render
    --------------------------------------------- */

    renderer.render(
        scene,
        camera
    );

}


animate();


/* =====================================================
   RESIZE
===================================================== */

function resize() {

    const width =
        container.clientWidth;

    const height =
        container.clientHeight;


    camera.aspect =
        width / height;

    camera.updateProjectionMatrix();


    renderer.setSize(
        width,
        height
    );

}


window.addEventListener(
    "resize",
    resize
);


/* =====================================================
   SCROLL REVEAL
===================================================== */

const revealElements =
    document.querySelectorAll(".reveal");


const observer =
    new IntersectionObserver(

        (entries) => {

            entries.forEach(
                (entry) => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target
                            .classList
                            .add("visible");


                        observer.unobserve(
                            entry.target
                        );

                    }

                }
            );

        },

        {
            threshold: 0.15
        }

    );


revealElements.forEach(
    (element) => {

        observer.observe(
            element
        );

    }
);