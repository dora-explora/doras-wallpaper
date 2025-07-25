#version 300 es

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
out vec4 fragColor;

uniform int frame;
uniform float pressure;
uniform vec2 resolution;
uniform sampler2D backbuffer;
uniform int notificationCount;

const vec4 COLOR = vec4(0.3, 0.9, 0.3, 1.0);

vec4 get_vec(float x, float y) {
    return texture(backbuffer, ((gl_FragCoord.xy + vec2(x, y)) / resolution));
}

bool get_bool(float x, float y) {
    vec4 color = get_vec(x, y);
    if (color[3] >= 0.9 && color != vec4(0., 0., 0., 1.)) {
        return true;
    } else {
        return false;
    }
}

float random (in float seed) {
    return fract(sin(seed) * 43758.5453123);
}

bool spawn(int y, in float seed) {
    float random = random(seed);
    if (random < 0.1) {
        return (y == 150);
    } else if (0.1 < random && random < 0.2) {
        return (y == 145);
    } else if (0.2 < random && random < 0.3) {
        return (y == 140);
    } else if (0.3 < random && random < 0.4) {
        return (y == 135);
    } else if (0.4 < random && random < 0.5) {
        return (y == 130);
    } else if (0.5 < random && random < 0.6) {
        return (y == 125);
    } else if (0.6 < random && random < 0.7) {
        return (y == 120);
    } else if (0.7 < random && random < 0.8) {
        return (y == 115);
    } else if (0.8 < random && random < 0.9) {
        return (y == 110);
    } else {
        return (y == 105);
    }
}

void main() {
    int x = int(gl_FragCoord.x);
    int y = int(gl_FragCoord.y);
    vec4 color = get_vec(0., 0.) - 0.1;
    if (color[3] == 0.) {
        color = vec4(0.);
    }


    if (y % 5 == 0) { // runs if on horizontal lines of grid
        if (x % 5 == 2) { // runs if in a deciding position
            if (get_bool(-1., 0.)) {
            // if (true) {
                if (random(pressure + gl_FragCoord.x + gl_FragCoord.y) > 0.5) {
                    color = COLOR;
                }
            }
        } else {
            if (get_bool(-1., 0.)) {
                color = COLOR;
            }
        }
    } 

    if (x % 5 == 1) { // runs if on vertical lines of grid
        if (y % 5 == 4) { // runs if in a deciding position
            if (get_bool(0., 1.)) {
                if (random(pressure + gl_FragCoord.x + gl_FragCoord.y + 2.) <= 0.5) {
                    color = COLOR;
                }
            }
        } else {
            if (get_bool(0., 1.)) {
                color = COLOR;
            }
        }
    } 

    if (frame % 10 == 0 && x == 1) {
        if (spawn(y, pressure)) {
            color = COLOR;
        }
    }

    if (notificationCount == 0) {
        if ((16 < x && x < 51) && (60 < y && y < 110) ) {
            color = vec4(0., 0., 0., color[3]);
        }
    }

    fragColor = color;
}