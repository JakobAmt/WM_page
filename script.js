import * as THREE from "three";
import { STLLoader } from "three/addons/loaders/STLLoader.js";


/* =====================================================
   SETTINGS
===================================================== */

// Rotate the actual STL model once when loading.
// This does NOT affect the animation axes.
const modelCorrectionX = -Math.PI / 2.5;


// Size of the model
const modelSize = 2.3;


// Initial position
const modelPositionX = 0;
const modelPositionY = 0;
const modelPositionZ = 0;


// Normal animation starting orientation
const modelRotationX = -0.15;
const modelRotationY = 0;
const modelRotationZ = 0;


/* =====================================================
   THREE.JS SETUP
===================================================== */

const container =
    document.getElementById("three-container");


const scene = new THREE.Scene();


const camera =
    new THREE.PerspectiveCamera(
        35,
        container.clientWidth /
        container.clientHeight,
        0.1,
        100
    );


camera.position.set(
    0,
    0,
    5
);


/* =====================================================
   RENDERER
===================================================== */

const renderer =
    new THREE.WebGLRenderer({
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


container.appendChild(
    renderer.domElement
);


/* =====================================================
   LIGHTING
===================================================== */

const ambientLight =
    new THREE.AmbientLight(
        0xffffff,
        2
    );

scene.add(ambientLight);


const keyLight =
    new THREE.DirectionalLight(
        0xffffff,
        4
    );

keyLight.position.set(
    3,
    4,
    5
);

scene.add(keyLight);


const fillLight =
    new THREE.DirectionalLight(
        0xffffff,
        2
    );

fillLight.position.set(
    -4,
    1,
    2
);

scene.add(fillLight);


/* =====================================================
   LOAD STL
===================================================== */

const loader =
    new STLLoader();


let model = null;


loader.load(

    "models/watchmate_model.stl",

    (geometry) => {

        /* ---------------------------------------------
           MODEL CORRECTION

           This rotates the actual STL geometry.

           It happens ONCE.

           The animation does not know about this
           rotation, so cursor interaction remains
           consistent.
        --------------------------------------------- */

        geometry.rotateX(modelCorrectionX);


        /* ---------------------------------------------
           NORMALS
        --------------------------------------------- */

        geometry.computeVertexNormals();


        /* ---------------------------------------------
           MATERIAL
        --------------------------------------------- */

        const material =
            new THREE.MeshStandardMaterial({

                color: 0xf4f0df,

                roughness: 0.38,

                metalness: 0.05

            });


        /* ---------------------------------------------
           CREATE MODEL
        --------------------------------------------- */

        model =
            new THREE.Mesh(
                geometry,
                material
            );


        /* ---------------------------------------------
           CENTER MODEL
        --------------------------------------------- */

        geometry.computeBoundingBox();


        const box =
            geometry.boundingBox;


        const center =
            new THREE.Vector3();


        box.getCenter(center);


        geometry.translate(
            -center.x,
            -center.y,
            -center.z
        );


        /* ---------------------------------------------
           SCALE
        --------------------------------------------- */

        const size =
            new THREE.Vector3();


        box.getSize(size);


        const maxDimension =
            Math.max(
                size.x,
                size.y,
                size.z
            );


        const scale =
            modelSize /
            maxDimension;


        model.scale.setScalar(
            scale
        );


        /* ---------------------------------------------
           NORMAL MODEL ROTATION

           Notice that there is NO correction here.

           The geometry has already been rotated above.
        --------------------------------------------- */

        model.rotation.x =
            modelRotationX;

        model.rotation.y =
            modelRotationY;

        model.rotation.z =
            modelRotationZ;


        /* ---------------------------------------------
           POSITION
        --------------------------------------------- */

        model.position.set(
            modelPositionX,
            modelPositionY,
            modelPositionZ
        );


        /* ---------------------------------------------
           ADD TO SCENE
        --------------------------------------------- */

        scene.add(model);


        console.log(
            "WatchMate model loaded."
        );

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


window.addEventListener(
    "mousemove",
    (event) => {

        mouseX =
            (event.clientX /
            window.innerWidth) - 0.5;

        mouseY =
            (event.clientY /
            window.innerHeight) - 0.5;

    }
);


/* =====================================================
   TOUCH
===================================================== */

window.addEventListener(
    "touchmove",
    (event) => {

        if (!event.touches.length) {
            return;
        }


        const touch =
            event.touches[0];


        mouseX =
            (touch.clientX /
            window.innerWidth) - 0.5;


        mouseY =
            (touch.clientY /
            window.innerHeight) - 0.5;

    },
    {
        passive: true
    }
);


/* =====================================================
   ANIMATION
===================================================== */

const clock =
    new THREE.Clock();


function animate() {

    requestAnimationFrame(animate);


    const elapsed =
        clock.getElapsedTime();


    /* ---------------------------------------------
       SMOOTH CURSOR
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
            Cursor interaction.

            These rotations operate on the MODEL'S
            normal coordinate system.

            The STL correction above does not alter
            these values.
        */

        const cursorRotationY =
            targetX * 0.35;


        const cursorRotationX =
            targetY * 0.20;


        model.rotation.x =
            modelRotationX +
            cursorRotationX;


        model.rotation.y =
            modelRotationY +
            cursorRotationY;


        model.rotation.z =
            modelRotationZ;


        /* -----------------------------------------
           FLOATING
        ----------------------------------------- */

        model.position.y =
            modelPositionY +
            Math.sin(
                elapsed * 1.2
            ) * 0.08;

    }


    /* ---------------------------------------------
       RENDER
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
    document.querySelectorAll(
        ".reveal"
    );


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