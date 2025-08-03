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
uniform bool powerConnected;
uniform int pointerCount;
uniform vec3 pointers[10];

vec4 get_vec(float x, float y) {
    return texture(backbuffer, ((gl_FragCoord.xy + vec2(x, y)) / resolution));
}

vec4 get_data() {
    return texture(backbuffer, vec2(0));
}

bool get_check(float x, float y) {
    vec4 color = get_vec(x, y);
    if (color[3] == 1. && color != vec4(0., 0., 0., 1.)) {
        return true;
    } else {
        return false;
    }
}

bool vec_check(vec4 color) {
    if (color == vec4(0., 0., 0., 1.)) {
        color = vec4(0.);
    }
    if (color[3] == 1.) {
        return true;
    } else {
        return false;
    }
}

float random (in float seed) {
    return fract(sin(seed) * 43758.5453123);
}

// COLOR CUSTOMIZATION OPTIONS
// You can edit the rgb values of these colors to change the pallete to your liking!
// DO NOT edit the alpha values, they are important to the program
const vec4 FOREGROUND = vec4(0.3, 0.9, 0.3, 1.);
const vec4 FOREGROUND_DIM = vec4(1., 0.84, 1., 1.);
const vec4 BACKGROUND = vec4(0.17, 0.04, 0.2, 0.);
const vec4 CHARGING = vec4(0.7, 0.55, 0., 0.5);
const vec4 BUTTON = vec4(0.2, 0.9, 0.8, 0.);

void main() {
    int x = int(gl_FragCoord.x);
    int y = int(gl_FragCoord.y);
    vec4 color = get_vec(0., 0.);
    float seed = time + gl_FragCoord.x + (gl_FragCoord.y * 70.);

    if (x == 0 && y == 0) { // checks if its the data pixel
        if (powerConnected) {
            if (color[0] > 0. && color[0] <= 0.6) {
                color[0] += 0.008;
            } else if (color[0] < 1.) {
                color[0] += 0.006;
            }
        } else {
            if (color[0] >= 0.5) {
                color -= 0.009;
            } else if (color[0] > 0.) {
                color[0] -= 0.006;
            }  
        } 
    } else { 
    	color -= 0.1;

        // handles background pixels
        if (color[3] < 0.2) {
            color = BACKGROUND + (0.04 * sin(3. * time + 0.03 * (-gl_FragCoord.x + gl_FragCoord.y)));

            // handles charging indicator
            if (get_data()[0] > 0.) { 
                float threshold = 20. + 40. * get_data()[0] + 4. * sin(2. * time);
                vec4 old_color = color;
                float dist = distance(gl_FragCoord.xy, vec2(33.5, -30.));
                if (dist < threshold) {
                    color = CHARGING * (threshold - dist) / threshold;
                    color += (old_color * (1. - color[0]));
                    color += 0.03 * (0.5 - random(seed));
                }
            }

            // handles button glow
            if (distance(gl_FragCoord.xy, vec2(34, 42.)) < 8.) {
                vec4 old_color = color;
                float threshold = 9. + sin(2. * time);
                color = BUTTON * (threshold - distance(gl_FragCoord.xy, vec2(34, 42.))) / threshold;
                    color += (old_color * (1. - color[0]));
                    color += 0.04 * (0.5 - random(seed));
            }
        }

        // handles potential foreground pixels
        bool directed = (pointerCount > 0 && gl_FragCoord.x < pointers[0].x && gl_FragCoord.y > pointers[0].y);
        vec2 touch;
        if (directed) {
            touch = vec2(int(pointers[0].x / 5.) * 5, int(pointers[0].y / 5.) * 5);
        }

        if (y % 5 == 0 && x > 1 && x < 68) { // runs if on the horizontal lines of the grid
            if (x % 5 == 2) { // runs if in a deciding position
                if (get_check(-1., 0.)) {
                    if (!directed) {
                        if (random(seed) > 0.5) {
                            color = FOREGROUND;
                        }
                    } else {
                        if (float(x + y) < (touch.x + touch.y)) {
                            color = FOREGROUND;
                        }
                    }
                }
            } else {
                if (get_check(-1., 0.)) {
                    color = FOREGROUND;
                }
            }
        }

        if (x % 5 == 1 && y >= 0 && y < 150) { // runs if on the vertical lines of the grid
            if (y % 5 == 4) { // runs if in a deciding position
                if (get_check(0., 1.)) {
                    if (!directed) {
                        if (random(seed + 70. + 1.) <= 0.5) {
                            color = FOREGROUND;
                        }
                    } else {
                        if (float(x + y) >= (touch.x + touch.y)) {
                            color = FOREGROUND;
                        }
                    }
                }
            } else {
                if (get_check(0., 1.)) {
                    color = FOREGROUND;
                }
            }
        }

        // handles spawning pixels at the top and left
        if (frame % 7 == 0 && 
        ((x == 1 && y > 5 && y % 5 == 0) || 
        (x < 70 && x % 5 == 1 && y == 150))
        ) {
            if (random(seed) < 0.1) {
                color = FOREGROUND;
            }
        }

        // handles dimming lines under the clock
        if (notificationCount == 0) { // runs if the clock is in the center
            if ((16 < x && x < 51) && (60 < y && y < 110)) {
                if (color == FOREGROUND) {
                	color = FOREGROUND_DIM;
                }
            }
        } else { // runs if the clock is at the top
        	if (
        	((int(daytime[0]) % 12 < 10) && (2 < x && x < 26) && (129 < y && y < 141)) || // runs if hours has one digit
        	((int(daytime[0]) % 12 >= 10 || int(daytime[0]) == 0) && (2 < x && x < 31) && (129 < y && y < 141)) // runs if hours has two
        	) {
        		  if (color == FOREGROUND) {
        				color = FOREGROUND_DIM;
        		  }
        	  }
        }
    }

    fragColor = color;
}