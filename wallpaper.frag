#version 300 es

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
out vec4 fragColor;

uniform int frame;
uniform float time;
uniform vec2 resolution;
uniform sampler2D backbuffer;
uniform int notificationCount;
uniform vec3 daytime;

const vec4 FOREGROUND = vec4(0.3, 0.9, 0.3, 1.);
const vec4 FOREGROUND_DIM = vec4(0.1, 0.4, 0.6, 1.);
const vec4 BACKGROUND = vec4(0.15, 0.03, 0.19, 0);

vec4 get_vec(float x, float y) {
    return texture(backbuffer, ((gl_FragCoord.xy + vec2(x, y)) / resolution));
}

bool get_bool(float x, float y) {
    vec4 color = get_vec(x, y);
    if (color[3] == 1. && color != vec4(0., 0., 0., 1.)) {
        return true;
    } else {
        return false;
    }
}

float random (in float seed) {
    return fract(sin(seed) * 43758.5453123);
}

void main() {
    int x = int(gl_FragCoord.x);
    int y = int(gl_FragCoord.y);
    vec4 color = get_vec(0., 0.) - 0.1;
    if (color[3] < 0.2) {
        color = BACKGROUND;
    }

    float seed = time + gl_FragCoord.x + (gl_FragCoord.y * 50.);

    if (y % 5 == 0) { // runs if on horizontal lines of grid
        if (x % 5 == 2) { // runs if in a deciding position
            if (get_bool(-1., 0.)) {
            // if (true) {
                if (random(seed) > 0.5) {
                    color = FOREGROUND;
                }
            }
        } else {
            if (get_bool(-1., 0.)) {
                color = FOREGROUND;
            }
        }
    }

    if (x % 5 == 1) { // runs if on vertical lines of grid
        if (y % 5 == 4) { // runs if in a deciding position
            if (get_bool(0., 1.)) {
                if (random(seed + 51.) <= 0.5) {
                    color = FOREGROUND;
                }
            }
        } else {
            if (get_bool(0., 1.)) {
                color = FOREGROUND;
            }
        }
    }

    if (frame % 7 == 0 && ((x == 1 && y % 5 == 0) || (x % 5 == 1 && y == 150))) {
        if (random(seed) < 0.1) {
            color = FOREGROUND;
        }
    }

    if (notificationCount == 0) {
        if ((16 < x && x < 51) && (60 < y && y < 110)) {
            if (color == FOREGROUND) {
            	color = FOREGROUND_DIM;
            }
        }
    } else {
    	if (
    		((int(daytime[0]) % 12 < 10) && (2 < x && x < 26) && (129 < y && y < 141)) ||
    		((int(daytime[0]) % 12 >= 10) && (2 < x && x < 31) && (129 < y && y < 141))
    		) {
    		  if (color == FOREGROUND) {
    				color = FOREGROUND_DIM;
    		  }
    	  }
    }

    fragColor = color;
}