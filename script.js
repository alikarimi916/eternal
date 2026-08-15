/* =========================================================
   STILA — LAST LIGHT
   Ultimate Cinematic Three.js Experience
   ========================================================= */

(() => {
    "use strict";

    /* =====================================================
       GLOBAL CONFIG
    ===================================================== */

    const CONFIG = {
        starCount: 4200,
        dustCount: 1800,
        heartParticles: 2600,

        cameraZ: 18,

        mouseStrength: 1.2,

        heartScale: 2.65,

        transitionSpeed: 0.055,

        particleDepth: 35,

        mobileStarCount: 2200,
        mobileDustCount: 900
    };


    /* =====================================================
       DOM
    ===================================================== */

    const canvas = document.getElementById("three-canvas");

    const loader = document.getElementById("loader");
    const loaderBar = document.getElementById("loader-progress-bar");

    const intro = document.getElementById("intro");
    const story = document.getElementById("story");
    const heartScene = document.getElementById("heart-scene");
    const ending = document.getElementById("ending");

    const startBtn = document.getElementById("start-btn");
    const continueBtn = document.getElementById("continue-btn");
    const breakHeartBtn = document.getElementById("break-heart");

    const musicButton = document.getElementById("music-toggle");
    const scrollIndicator = document.getElementById("scroll-indicator");


    /* =====================================================
       MOBILE DETECTION
    ===================================================== */

    const isMobile =
        window.innerWidth <= 700 ||
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);


    /* =====================================================
       THREE.JS CORE
    ===================================================== */

    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0x020204);

    scene.fog = new THREE.FogExp2(
        0x030206,
        0.018
    );


    /* =====================================================
       CAMERA
    ===================================================== */

    const camera = new THREE.PerspectiveCamera(
        55,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    camera.position.set(
        0,
        0,
        CONFIG.cameraZ
    );


    /* =====================================================
       RENDERER
    ===================================================== */

    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: !isMobile,
        alpha: true,
        powerPreference: "high-performance"
    });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2)
    );

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.outputEncoding = THREE.sRGBEncoding;

    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure = 1.15;


    /* =====================================================
       CLOCK
    ===================================================== */

    const clock = new THREE.Clock();


    /* =====================================================
       STATE
    ===================================================== */

    const state = {

        scene: "intro",

        progress: 0,

        heartBroken: false,

        started: false,

        musicPlaying: false,

        mouseX: 0,

        mouseY: 0,

        targetMouseX: 0,

        targetMouseY: 0,

        touchX: 0,

        touchY: 0,

        cameraShake: 0,

        heartPulse: 0,

        transition: 0
    };


    /* =====================================================
       GROUPS
    ===================================================== */

    const universe = new THREE.Group();

    const starsGroup = new THREE.Group();

    const dustGroup = new THREE.Group();

    const nebulaGroup = new THREE.Group();

    const heartGroup = new THREE.Group();

    const heartParticlesGroup = new THREE.Group();

    const floatingObjectsGroup = new THREE.Group();

    universe.add(starsGroup);
    universe.add(dustGroup);
    universe.add(nebulaGroup);
    universe.add(heartGroup);
    universe.add(heartParticlesGroup);
    universe.add(floatingObjectsGroup);

    scene.add(universe);


    /* =====================================================
       LIGHTING
    ===================================================== */

    const ambientLight = new THREE.AmbientLight(
        0x342050,
        0.6
    );

    scene.add(ambientLight);


    const purpleLight = new THREE.PointLight(
        0x9b5cff,
        4,
        30
    );

    purpleLight.position.set(
        -5,
        2,
        4
    );

    scene.add(purpleLight);


    const pinkLight = new THREE.PointLight(
        0xff3d83,
        3,
        25
    );

    pinkLight.position.set(
        5,
        -2,
        2
    );

    scene.add(pinkLight);


    /* =====================================================
       UTILITIES
    ===================================================== */

    const random = (min, max) =>
        Math.random() * (max - min) + min;


    const clamp = (value, min, max) =>
        Math.max(min, Math.min(max, value));


    const lerp = (a, b, t) =>
        a + (b - a) * t;


    const easeOut = t =>
        1 - Math.pow(1 - t, 3);


    const easeInOut = t =>
        t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;


    /* =====================================================
       STAR FIELD
    ===================================================== */

    function createStars() {

        const count = isMobile
            ? CONFIG.mobileStarCount
            : CONFIG.starCount;

        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        const colorA = new THREE.Color(0xffffff);
        const colorB = new THREE.Color(0x9d72ff);
        const colorC = new THREE.Color(0xff6fae);

        for (let i = 0; i < count; i++) {

            const i3 = i * 3;

            const radius = random(10, 75);

            const theta = random(0, Math.PI * 2);

            const phi = Math.acos(
                random(-1, 1)
            );

            positions[i3] =
                radius *
                Math.sin(phi) *
                Math.cos(theta);

            positions[i3 + 1] =
                radius *
                Math.sin(phi) *
                Math.sin(theta);

            positions[i3 + 2] =
                radius *
                Math.cos(phi);

            const colorRoll = Math.random();

            let color;

            if (colorRoll < 0.72) {
                color = colorA;
            } else if (colorRoll < 0.9) {
                color = colorB;
            } else {
                color = colorC;
            }

            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            sizes[i] = random(0.5, 2.8);
        }

        const geometry =
            new THREE.BufferGeometry();

        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(
                positions,
                3
            )
        );

        geometry.setAttribute(
            "color",
            new THREE.BufferAttribute(
                colors,
                3
            )
        );

        geometry.setAttribute(
            "size",
            new THREE.BufferAttribute(
                sizes,
                1
            )
        );

        const material =
            new THREE.PointsMaterial({

                size: isMobile ? 0.09 : 0.12,

                vertexColors: true,

                transparent: true,

                opacity: 0.9,

                depthWrite: false,

                blending:
                    THREE.AdditiveBlending
            });

        const stars =
            new THREE.Points(
                geometry,
                material
            );

        starsGroup.add(stars);

        return stars;
    }

    const stars = createStars();


    /* =====================================================
       FLOATING DUST
    ===================================================== */

    function createDust() {

        const count = isMobile
            ? CONFIG.mobileDustCount
            : CONFIG.dustCount;

        const positions = new Float32Array(
            count * 3
        );

        const colors = new Float32Array(
            count * 3
        );

        for (let i = 0; i < count; i++) {

            const i3 = i * 3;

            positions[i3] =
                random(-30, 30);

            positions[i3 + 1] =
                random(-20, 20);

            positions[i3 + 2] =
                random(-15, 25);

            const purple =
                Math.random() > 0.35;

            if (purple) {

                colors[i3] = 0.45;
                colors[i3 + 1] = 0.2;
                colors[i3 + 2] = 1;

            } else {

                colors[i3] = 1;
                colors[i3 + 1] = 0.25;
                colors[i3 + 2] = 0.55;
            }
        }

        const geometry =
            new THREE.BufferGeometry();

        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(
                positions,
                3
            )
        );

        geometry.setAttribute(
            "color",
            new THREE.BufferAttribute(
                colors,
                3
            )
        );

        const material =
            new THREE.PointsMaterial({

                size: isMobile ? 0.08 : 0.12,

                vertexColors: true,

                transparent: true,

                opacity: 0.45,

                depthWrite: false,

                blending:
                    THREE.AdditiveBlending
            });

        const dust =
            new THREE.Points(
                geometry,
                material
            );

        dustGroup.add(dust);

        return dust;
    }

    const dust = createDust();


    /* =====================================================
       NEBULA PARTICLES
    ===================================================== */

    function createNebula() {

        const count = isMobile ? 500 : 900;

        const positions =
            new Float32Array(count * 3);

        const colors =
            new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {

            const i3 = i * 3;

            const angle =
                random(0, Math.PI * 2);

            const radius =
                Math.pow(Math.random(), 1.7) * 18;

            positions[i3] =
                Math.cos(angle) *
                radius;

            positions[i3 + 1] =
                Math.sin(angle) *
                radius *
                0.35;

            positions[i3 + 2] =
                random(-5, 15);

            const c =
                new THREE.Color();

            if (Math.random() > 0.5) {

                c.setHSL(
                    random(0.72, 0.82),
                    0.75,
                    0.55
                );

            } else {

                c.setHSL(
                    random(0.92, 1),
                    0.7,
                    0.55
                );
            }

            colors[i3] = c.r;
            colors[i3 + 1] = c.g;
            colors[i3 + 2] = c.b;
        }

        const geometry =
            new THREE.BufferGeometry();

        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(
                positions,
                3
            )
        );

        geometry.setAttribute(
            "color",
            new THREE.BufferAttribute(
                colors,
                3
            )
        );

        const material =
            new THREE.PointsMaterial({

                size: isMobile ? 0.18 : 0.23,

                vertexColors: true,

                transparent: true,

                opacity: 0.08,

                depthWrite: false,

                blending:
                    THREE.AdditiveBlending
            });

        const nebula =
            new THREE.Points(
                geometry,
                material
            );

        nebulaGroup.add(nebula);

        return nebula;
    }

    const nebula = createNebula();


    /* =====================================================
       HEART GEOMETRY
    ===================================================== */

    function heartPoint(t, scale = 1) {

        const x =
            16 *
            Math.pow(Math.sin(t), 3);

        const y =
            13 * Math.cos(t)
            - 5 * Math.cos(2 * t)
            - 2 * Math.cos(3 * t)
            - Math.cos(4 * t);

        return {
            x: x * 0.18 * scale,
            y: y * 0.18 * scale
        };
    }


    function createHeart() {

        const points = [];

        const layers = 32;

        const pointsPerLayer = 140;

        for (let layer = 0; layer < layers; layer++) {

            const z =
                (layer / (layers - 1) - 0.5)
                * 1.7;

            const layerScale =
                0.78 +
                0.22 *
                Math.sin(
                    (layer / (layers - 1))
                    * Math.PI
                );

            for (
                let i = 0;
                i < pointsPerLayer;
                i++
            ) {

                const t =
                    (i / pointsPerLayer)
                    * Math.PI * 2;

                const p =
                    heartPoint(
                        t,
                        CONFIG.heartScale *
                        layerScale
                    );

                const thickness =
                    Math.random() *
                    0.35;

                points.push(
                    p.x + random(-thickness, thickness),
                    p.y + random(-thickness, thickness),
                    z + random(-0.25, 0.25)
                );
            }
        }

        const positions =
            new Float32Array(points);

        const original =
            new Float32Array(points);

        const velocities =
            new Float32Array(points.length);

        const colors =
            new Float32Array(points.length);

        for (let i = 0; i < points.length; i += 3) {

            const color =
                new THREE.Color();

            const mix =
                Math.random();

            if (mix < 0.55) {

                color.setHSL(
                    0.93 + random(-0.03, 0.03),
                    0.9,
                    0.58
                );

            } else {

                color.setHSL(
                    0.75 + random(-0.03, 0.03),
                    0.85,
                    0.6
                );
            }

            colors[i] = color.r;
            colors[i + 1] = color.g;
            colors[i + 2] = color.b;
        }

        const geometry =
            new THREE.BufferGeometry();

        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(
                positions,
                3
            )
        );

        geometry.setAttribute(
            "color",
            new THREE.BufferAttribute(
                colors,
                3
            )
        );

        const material =
            new THREE.PointsMaterial({

                size: isMobile ? 0.045 : 0.055,

                vertexColors: true,

                transparent: true,

                opacity: 0.92,

                depthWrite: false,

                blending:
                    THREE.AdditiveBlending
            });

        const heart =
            new THREE.Points(
                geometry,
                material
            );

        heartGroup.add(heart);

        return {
            mesh: heart,
            original,
            velocities
        };
    }

    const heartData =
        createHeart();

    const heart =
        heartData.mesh;


    /* =====================================================
       HEART GLOW RINGS
    ===================================================== */

    function createHeartGlow() {

        for (let i = 0; i < 3; i++) {

            const geometry =
                new THREE.RingGeometry(
                    2.7 + i * 0.6,
                    2.72 + i * 0.6,
                    96
                );

            const material =
                new THREE.MeshBasicMaterial({

                    color:
                        i === 0
                            ? 0xff3d83
                            : 0x8d5cff,

                    transparent: true,

                    opacity:
                        0.12 - i * 0.025,

                    side:
                        THREE.DoubleSide,

                    blending:
                        THREE.AdditiveBlending,

                    depthWrite: false
                });

            const ring =
                new THREE.Mesh(
                    geometry,
                    material
                );

            ring.rotation.x =
                Math.PI / 2;

            ring.rotation.z =
                random(0, Math.PI);

            heartGroup.add(ring);
        }
    }

    createHeartGlow();


    /* =====================================================
       HEART CORE
    ===================================================== */

    const coreGeometry =
        new THREE.SphereGeometry(
            0.55,
            32,
            32
        );

    const coreMaterial =
        new THREE.MeshBasicMaterial({

            color: 0xff4c91,

            transparent: true,

            opacity: 0.28,

            blending:
                THREE.AdditiveBlending
        });

    const heartCore =
        new THREE.Mesh(
            coreGeometry,
            coreMaterial
        );

    heartCore.scale.set(
        1.3,
        1.3,
        1.3
    );

    heartGroup.add(heartCore);


    /* =====================================================
       HEART LIGHT
    ===================================================== */

    const heartLight =
        new THREE.PointLight(
            0xff3d83,
            5,
            15
        );

    heartLight.position.set(
        0,
        0,
        1
    );

    heartGroup.add(heartLight);


    /* =====================================================
       HEART PARTICLE EXPLOSION
    ===================================================== */

    function createHeartExplosion() {

        const count =
            isMobile
                ? 1100
                : CONFIG.heartParticles;

        const positions =
            new Float32Array(count * 3);

        const velocities =
            new Float32Array(count * 3);

        const colors =
            new Float32Array(count * 3);

        const sizes =
            new Float32Array(count);

        for (let i = 0; i < count; i++) {

            const i3 = i * 3;

            const t =
                random(0, Math.PI * 2);

            const p =
                heartPoint(
                    t,
                    CONFIG.heartScale
                );

            positions[i3] =
                p.x + random(-1, 1);

            positions[i3 + 1] =
                p.y + random(-1, 1);

            positions[i3 + 2] =
                random(-1, 1);

            const direction =
                new THREE.Vector3(
                    positions[i3],
                    positions[i3 + 1],
                    positions[i3 + 2]
                ).normalize();

            velocities[i3] =
                direction.x *
                random(0.015, 0.055);

            velocities[i3 + 1] =
                direction.y *
                random(0.015, 0.055);

            velocities[i3 + 2] =
                direction.z *
                random(0.015, 0.055);

            const color =
                new THREE.Color();

            color.setHSL(
                Math.random() > 0.5
                    ? random(0.9, 1)
                    : random(0.7, 0.82),
                0.9,
                0.6
            );

            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            sizes[i] =
                random(0.4, 1.8);
        }

        const geometry =
            new THREE.BufferGeometry();

        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(
                positions,
                3
            )
        );

        geometry.setAttribute(
            "color",
            new THREE.BufferAttribute(
                colors,
                3
            )
        );

        geometry.setAttribute(
            "size",
            new THREE.BufferAttribute(
                sizes,
                1
            )
        );

        const material =
            new THREE.PointsMaterial({

                size:
                    isMobile
                        ? 0.06
                        : 0.075,

                vertexColors: true,

                transparent: true,

                opacity: 0,

                depthWrite: false,

                blending:
                    THREE.AdditiveBlending
            });

        const particles =
            new THREE.Points(
                geometry,
                material
            );

        heartParticlesGroup.add(
            particles
        );

        return {
            mesh: particles,
            velocities
        };
    }

    const explosion =
        createHeartExplosion();


    /* =====================================================
       FLOATING GLASS FRAGMENTS
    ===================================================== */

    function createFloatingFragments() {

        const count = isMobile ? 20 : 38;

        for (let i = 0; i < count; i++) {

            const geometry =
                new THREE.IcosahedronGeometry(
                    random(0.015, 0.06),
                    0
                );

            const material =
                new THREE.MeshBasicMaterial({

                    color:
                        Math.random() > 0.5
                            ? 0x9b6cff
                            : 0xff5f9e,

                    transparent: true,

                    opacity: random(0.15, 0.5),

                    blending:
                        THREE.AdditiveBlending
                });

            const object =
                new THREE.Mesh(
                    geometry,
                    material
                );

            object.position.set(
                random(-9, 9),
                random(-6, 6),
                random(-2, 12)
            );

            object.userData.speed =
                random(0.001, 0.006);

            object.userData.rotation =
                random(-0.01, 0.01);

            object.userData.offset =
                random(0, Math.PI * 2);

            floatingObjectsGroup.add(
                object
            );
        }
    }

    createFloatingFragments();


    /* =====================================================
       HEART POSITION
    ===================================================== */

    heartGroup.position.set(
        0,
        0,
        1
    );

    heartGroup.scale.set(
        0.001,
        0.001,
        0.001
    );


    /* =====================================================
       INTRO UNIVERSE POSITION
    ===================================================== */

    universe.rotation.x = 0.03;

    universe.rotation.y = -0.05;


    /* =====================================================
       MOUSE / TOUCH
    ===================================================== */

    function updatePointer(x, y) {

        state.targetMouseX =
            (x / window.innerWidth - 0.5)
            * 2;

        state.targetMouseY =
            (y / window.innerHeight - 0.5)
            * 2;
    }


    window.addEventListener(
        "mousemove",
        event => {

            updatePointer(
                event.clientX,
                event.clientY
            );
        },
        { passive: true }
    );


    window.addEventListener(
        "touchmove",
        event => {

            if (!event.touches.length)
                return;

            updatePointer(
                event.touches[0].clientX,
                event.touches[0].clientY
            );

        },
        { passive: true }
    );


    /* =====================================================
       CAMERA MOVEMENT
    ===================================================== */

    function updateCamera(time) {

        state.mouseX =
            lerp(
                state.mouseX,
                state.targetMouseX,
                0.035
            );

        state.mouseY =
            lerp(
                state.mouseY,
                state.targetMouseY,
                0.035
            );

        const breathing =
            Math.sin(time * 0.45) * 0.08;

        camera.position.x =
            state.mouseX *
            CONFIG.mouseStrength;

        camera.position.y =
            -state.mouseY *
            CONFIG.mouseStrength;

        camera.position.z =
            CONFIG.cameraZ +
            breathing;

        camera.rotation.x =
            -state.mouseY * 0.025;

        camera.rotation.y =
            state.mouseX * 0.035;

        if (state.cameraShake > 0) {

            camera.position.x +=
                random(
                    -state.cameraShake,
                    state.cameraShake
                );

            camera.position.y +=
                random(
                    -state.cameraShake,
                    state.cameraShake
                );

            state.cameraShake *= 0.91;
        }
    }


    /* =====================================================
       STAR ANIMATION
    ===================================================== */

    function animateStars(time) {

        stars.rotation.y =
            time * 0.006;

        stars.rotation.x =
            Math.sin(time * 0.08)
            * 0.025;

        dust.rotation.y =
            -time * 0.003;

        dust.rotation.x =
            Math.cos(time * 0.05)
            * 0.02;

        nebula.rotation.z =
            time * 0.002;

        nebula.rotation.y =
            time * 0.001;
    }


    /* =====================================================
       HEART ANIMATION
    ===================================================== */

    function animateHeart(time) {

        if (state.heartBroken)
            return;

        const beat =
            Math.pow(
                Math.max(
                    0,
                    Math.sin(time * 3.2)
                ),
                8
            );

        const secondBeat =
            Math.pow(
                Math.max(
                    0,
                    Math.sin(time * 3.2 + 0.5)
                ),
                12
            );

        const pulse =
            1 +
            beat * 0.075 +
            secondBeat * 0.035;

        heart.scale.set(
            pulse,
            pulse,
            pulse
        );

        heartCore.scale.set(
            1.2 + beat * 0.45,
            1.2 + beat * 0.45,
            1.2 + beat * 0.45
        );

        heartCore.material.opacity =
            0.22 +
            beat * 0.3;

        heartLight.intensity =
            3.5 +
            beat * 5;

        heartGroup.rotation.y =
            Math.sin(time * 0.35)
            * 0.15;

        heartGroup.rotation.x =
            Math.sin(time * 0.27)
            * 0.04;

        heartGroup.children.forEach(
            (child, index) => {

                if (
                    child.isMesh &&
                    child.geometry &&
                    child.geometry.type ===
                        "RingGeometry"
                ) {

                    child.rotation.z +=
                        0.001 *
                        (index + 1);
                }
            }
        );
    }


    /* =====================================================
       HEART INTRO SCALE
    ===================================================== */

    function revealHeart() {

        if (state.heartBroken)
            return;

        const target = 1;

        const current =
            heartGroup.scale.x;

        const next =
            lerp(
                current,
                target,
                0.045
            );

        heartGroup.scale.set(
            next,
            next,
            next
        );
    }


    /* =====================================================
       EXPLOSION ANIMATION
    ===================================================== */

    function animateExplosion() {

        if (!state.heartBroken)
            return;

        const position =
            explosion.mesh.geometry
                .attributes.position.array;

        const velocity =
            explosion.velocities;

        for (
            let i = 0;
            i < position.length;
            i += 3
        ) {

            velocity[i + 1] -= 0.00015;

            position[i] +=
                velocity[i];

            position[i + 1] +=
                velocity[i + 1];

            position[i + 2] +=
                velocity[i + 2];

            velocity[i] *= 0.997;
            velocity[i + 1] *= 0.997;
            velocity[i + 2] *= 0.997;
        }

        explosion.mesh.geometry
            .attributes
            .position
            .needsUpdate = true;

        explosion.mesh.material.opacity =
            Math.max(
                0,
                explosion.mesh.material.opacity
                - 0.0007
            );
    }


    /* =====================================================
       FLOATING OBJECTS
    ===================================================== */

    function animateFloatingObjects(time) {

        floatingObjectsGroup.children.forEach(
            object => {

                object.position.y +=
                    Math.sin(
                        time *
                        object.userData.speed *
                        1000 +
                        object.userData.offset
                    ) * 0.0005;

                object.rotation.x +=
                    object.userData.rotation;

                object.rotation.y +=
                    object.userData.rotation;

            }
        );
    }


    /* =====================================================
       HEART BREAK
    ===================================================== */

    function breakHeart() {

        if (state.heartBroken)
            return;

        state.heartBroken = true;

        state.cameraShake = 0.18;

        heart.visible = false;

        heartCore.visible = false;

        heartLight.intensity = 0;

        explosion.mesh.material.opacity =
            1;

        explosion.mesh.scale.set(
            1,
            1,
            1
        );

        explosion.mesh.rotation.set(
            0,
            0,
            0
        );

        /* موج انفجار */

        const shockGeometry =
            new THREE.RingGeometry(
                0.1,
                0.2,
                64
            );

        const shockMaterial =
            new THREE.MeshBasicMaterial({

                color: 0xff4f91,

                transparent: true,

                opacity: 0.8,

                side: THREE.DoubleSide,

                blending:
                    THREE.AdditiveBlending
            });

        const shock =
            new THREE.Mesh(
                shockGeometry,
                shockMaterial
            );

        shock.rotation.x =
            Math.PI / 2;

        heartGroup.add(shock);

        let shockScale = 1;

        function animateShock() {

            shockScale *= 1.045;

            shock.scale.set(
                shockScale,
                shockScale,
                shockScale
            );

            shock.material.opacity *= 0.94;

            if (
                shock.material.opacity > 0.01
            ) {

                requestAnimationFrame(
                    animateShock
                );

            } else {

                heartGroup.remove(shock);

                shock.geometry.dispose();

                shock.material.dispose();
            }
        }

        animateShock();

        /* لرزش ستاره‌ها */

        starsGroup.rotation.x += 0.2;

        starsGroup.rotation.y -= 0.15;

        /* انتقال به پایان */

        setTimeout(() => {

            changeScene("ending");

        }, 2600);
    }


    /* =====================================================
       SCENE MANAGEMENT
    ===================================================== */

    function hideAllScreens() {

        [
            intro,
            story,
            heartScene,
            ending
        ].forEach(screen => {

            screen.classList.remove(
                "active"
            );

        });
    }


    function changeScene(nextScene) {

        state.scene = nextScene;

        hideAllScreens();

        if (nextScene === "intro") {

            intro.classList.add("active");

            scrollIndicator.style.opacity = "1";

        }

        if (nextScene === "story") {

            story.classList.add("active");

            scrollIndicator.style.opacity = "1";
        }

        if (nextScene === "heart") {

            heartScene.classList.add(
                "active"
            );

            scrollIndicator.style.opacity = "0";

            revealHeart();
        }

        if (nextScene === "ending") {

            ending.classList.add("active");

            scrollIndicator.style.opacity = "0";
        }
    }


    /* =====================================================
       START EXPERIENCE
    ===================================================== */

    function startExperience() {

        if (state.started)
            return;

        state.started = true;

        changeScene("story");

        camera.position.z = 13;

        state.cameraShake = 0.02;

        setTimeout(() => {

            camera.position.z =
                CONFIG.cameraZ;

        }, 1200);
    }


    /* =====================================================
       CONTINUE STORY
    ===================================================== */

    function continueStory() {

        changeScene("heart");

        heartGroup.scale.set(
            0.01,
            0.01,
            0.01
        );

        setTimeout(() => {

            revealHeart();

        }, 100);
    }


    /* =====================================================
       START BUTTON
    ===================================================== */

    if (startBtn) {

        startBtn.addEventListener(
            "click",
            startExperience
        );
    }


    /* =====================================================
       CONTINUE BUTTON
    ===================================================== */

    if (continueBtn) {

        continueBtn.addEventListener(
            "click",
            continueStory
        );
    }


    /* =====================================================
       BREAK HEART BUTTON
    ===================================================== */

    if (breakHeartBtn) {

        breakHeartBtn.addEventListener(
            "click",
            breakHeart
        );
    }


    /* =====================================================
       CLICK HEART
    ===================================================== */

    canvas.addEventListener(
        "click",
        () => {

            if (
                state.scene === "heart" &&
                !state.heartBroken
            ) {

                breakHeart();
            }
        }
    );


    /* =====================================================
       WHEEL NAVIGATION
    ===================================================== */

    let wheelLocked = false;

    window.addEventListener(
        "wheel",
        event => {

            if (wheelLocked)
                return;

            if (
                Math.abs(event.deltaY) < 15
            )
                return;

            wheelLocked = true;

            if (
                event.deltaY > 0
            ) {

                if (
                    state.scene === "intro"
                ) {

                    startExperience();

                } else if (
                    state.scene === "story"
                ) {

                    continueStory();

                } else if (
                    state.scene === "heart" &&
                    !state.heartBroken
                ) {

                    breakHeart();
                }
            }

            if (
                event.deltaY < 0
            ) {

                if (
                    state.scene === "story"
                ) {

                    changeScene("intro");

                } else if (
                    state.scene === "heart"
                ) {

                    changeScene("story");
                }
            }

            setTimeout(
                () => {
                    wheelLocked = false;
                },
                1000
            );

        },
        { passive: true }
    );


    /* =====================================================
       TOUCH SWIPE
    ===================================================== */

    let touchStartY = 0;

    window.addEventListener(
        "touchstart",
        event => {

            if (!event.touches.length)
                return;

            touchStartY =
                event.touches[0].clientY;

        },
        { passive: true }
    );


    window.addEventListener(
        "touchend",
        event => {

            if (!event.changedTouches.length)
                return;

            const endY =
                event.changedTouches[0].clientY;

            const distance =
                touchStartY - endY;

            if (
                Math.abs(distance) < 60
            )
                return;

            if (distance > 0) {

                if (
                    state.scene === "intro"
                ) {

                    startExperience();

                } else if (
                    state.scene === "story"
                ) {

                    continueStory();

                } else if (
                    state.scene === "heart"
                ) {

                    breakHeart();
                }

            } else {

                if (
                    state.scene === "story"
                ) {

                    changeScene("intro");

                } else if (
                    state.scene === "heart"
                ) {

                    changeScene("story");
                }
            }

        },
        { passive: true }
    );


    /* =====================================================
       MUSIC SYSTEM
       ===================================================== */

    let audioContext = null;

    let masterGain = null;

    let oscillator = null;

    let musicInterval = null;


    function createAmbientMusic() {

        if (audioContext)
            return;

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

        masterGain =
            audioContext.createGain();

        masterGain.gain.value = 0.025;

        masterGain.connect(
            audioContext.destination
        );

        oscillator =
            audioContext.createOscillator();

        const oscillatorGain =
            audioContext.createGain();

        oscillator.type = "sine";

        oscillator.frequency.value =
            55;

        oscillatorGain.gain.value =
            0.08;

        oscillator.connect(
            oscillatorGain
        );

        oscillatorGain.connect(
            masterGain
        );

        oscillator.start();

        musicInterval =
            setInterval(() => {

                if (!audioContext)
                    return;

                const frequencies = [
                    55,
                    65.41,
                    73.42,
                    82.41
                ];

                oscillator.frequency
                    .linearRampToValueAtTime(
                        frequencies[
                            Math.floor(
                                Math.random() *
                                frequencies.length
                            )
                        ],
                        audioContext.currentTime + 2
                    );

            }, 2000);
    }


    if (musicButton) {

        musicButton.addEventListener(
            "click",
            () => {

                if (!audioContext) {

                    createAmbientMusic();

                    state.musicPlaying = true;

                    musicButton.style.color =
                        "#ff5f9e";

                } else {

                    if (
                        audioContext.state ===
                        "running"
                    ) {

                        audioContext.suspend();

                        state.musicPlaying =
                            false;

                        musicButton.style.color =
                            "rgba(255,255,255,.65)";

                    } else {

                        audioContext.resume();

                        state.musicPlaying =
                            true;

                        musicButton.style.color =
                            "#ff5f9e";
                    }
                }
            }
        );
    }


    /* =====================================================
       LOADER
    ===================================================== */

    function runLoader() {

        let progress = 0;

        const loaderInterval =
            setInterval(() => {

                progress +=
                    random(2, 8);

                progress =
                    Math.min(
                        progress,
                        100
                    );

                if (loaderBar) {

                    loaderBar.style.width =
                        `${progress}%`;
                }

                if (progress >= 100) {

                    clearInterval(
                        loaderInterval
                    );

                    setTimeout(() => {

                        loader.classList.add(
                            "hidden"
                        );

                    }, 500);
                }

            }, 70);
    }


    /* =====================================================
       RESIZE
    ===================================================== */

    function onResize() {

        const width =
            window.innerWidth;

        const height =
            window.innerHeight;

        camera.aspect =
            width / height;

        camera.updateProjectionMatrix();

        renderer.setSize(
            width,
            height
        );

        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio,
                isMobile ? 1.5 : 2
            )
        );
    }


    window.addEventListener(
        "resize",
        onResize
    );


    /* =====================================================
       VISIBILITY
    ===================================================== */

    document.addEventListener(
        "visibilitychange",
        () => {

            if (
                document.hidden &&
                audioContext
            ) {

                audioContext.suspend();

            } else if (
                !document.hidden &&
                audioContext &&
                state.musicPlaying
            ) {

                audioContext.resume();
            }
        }
    );


    /* =====================================================
       CINEMATIC COLOR BREATHING
    ===================================================== */

    function cinematicLighting(time) {

        const wave =
            (Math.sin(time * 0.35) + 1)
            * 0.5;

        purpleLight.intensity =
            3.2 +
            wave * 1.3;

        pinkLight.intensity =
            2.2 +
            (1 - wave) * 1.5;

        ambientLight.intensity =
            0.45 +
            wave * 0.15;
    }


    /* =====================================================
       MAIN RENDER LOOP
    ===================================================== */

    function animate() {

        requestAnimationFrame(
            animate
        );

        const delta =
            Math.min(
                clock.getDelta(),
                0.05
            );

        const time =
            clock.elapsedTime;


        /* Pointer */

        updateCamera(time);


        /* Universe */

        animateStars(time);

        animateFloatingObjects(time);

        cinematicLighting(time);


        /* Heart */

        if (
            state.scene === "heart"
        ) {

            revealHeart();

            animateHeart(time);
        }


        /* Explosion */

        animateExplosion();


        /* Slow universe movement */

        universe.position.x =
            Math.sin(time * 0.08)
            * 0.08;

        universe.position.y =
            Math.cos(time * 0.06)
            * 0.06;


        /* Render */

        renderer.render(
            scene,
            camera
        );
    }


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function init() {

        onResize();

        changeScene("intro");

        runLoader();

        animate();
    }


    /* =====================================================
       START
    ===================================================== */

    init();

})();