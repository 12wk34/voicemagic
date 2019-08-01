// Click 'Effect' or 'BGM' button will cause GLOBAL var changed
let Effect = 0
let BGM = 0
let IS_RECORDING = 0
let start_recorded = null
let thesound = null
// End of GLOBAL var

init_record();

window.addEventListener('load', () => {

    let C = [], M = [], Play = null, Record = null

    for(let i=0;i<6;i++) {
        C.push(document.querySelector('#C'+(i+1)))
        C[i].addEventListener('click', () => {
            if(Effect!=0) {
                let pre = document.querySelector('#C'+Effect)
                pre.firstElementChild.classList.remove('card-img-checked')
                pre.firstElementChild.classList.add('card-img')
            }
            
            Effect = i+1
            let after = document.querySelector('#C'+Effect)
            after.firstElementChild.classList.add('card-img-checked')
            after.firstElementChild.classList.remove('card-img')
            console.log(Effect)
        })
        M.push(document.querySelector('#M'+(i+1)))
        M[i].addEventListener('click', () => {
            if(BGM!=0) {
                let pre = document.querySelector('#M'+BGM)
                pre.firstElementChild.classList.remove('card-img-checked')
                pre.firstElementChild.classList.add('card-img')
            }
            
            BGM = i+1
            let after = document.querySelector('#M'+BGM)
            after.firstElementChild.classList.add('card-img-checked')
            after.firstElementChild.classList.remove('card-img')
            
            console.log(BGM)
        })
    }

    Record = document.querySelector('#Record')
    Play = document.querySelector('#Play')

    Record.addEventListener('click', () => {
        if(IS_RECORDING === 0){
            start_recorded = record(0.5);
            IS_RECORDING = 1;
        }
        else{
            IS_RECORDING = 0;
            thesound = start_recorded();
}
    })

    Play.addEventListener('click', () => {
        play_it(thesound(), changes[Effect], bgms[BGM]);
    })

})
/*****************************************************************************/
function FFT_SOUND(sound){
    const size = 131072;
//    const size = 1024;
    const f = new FFT(size);
    var data = discretize(get_wave(sound), get_duration(sound));
    const out=f.createComplexArray();
    data.length = size;
    const data2 = f.toComplexArray(data);
    f.transform(out,data2);
    
/*    for(i = 0; i < size * 2; i++){
        if(0.5 * i * FS / size < 300 || 0.5 * i * FS / size > 3400)
            out[i] = 0;
    }
*/

    for(i = size;i < 2 * size; i++){
        out[i] = 0;
    }
/*
    for(i = 200 * (2 * size / FS); i < 1400 * (2 * size / FS); i++){
        out[i] = out[i + 200 * (2 * size / FS)];
    }
    for(i = 1400 * (2 * size / FS); i < 1600 * (2 * size / FS); i++){
        out[i] = 0;
    }
*/

    for(i = Math.floor(2000 * (size / FS)); i > 700 * (size / FS); i--){
        out[2 * i] = out[2 * i - Math.floor(400 * (2 * size / FS))];
        out[2 * i + 1] = out[2 * i + 1 - Math.floor(400 * (2 * size / FS))];
    }
    for(i = Math.floor(3 * (size / FS)); i < 700 * (size / FS); i++){
        out[2 * i] = 0;
        out[2 * i + 1] = 0;
    }

    var _data=new Array(size);
    f.inverseTransform(_data,out);
    const _data2 = f.fromComplexArray(_data);
    _safeaudio = raw_to_audio(_data2);
    _safeaudio.addEventListener('ended', stop);
    _safeaudio.play();
    _safeplaying = true;
    return out;
}


function array_to_sound(sound_array){
    return make_sound(t => sound_array[Math.floor(t*FS)], Math.floor(sound_array.length/FS));
}

function change_volume(sound, k) {
    return make_sound(t => k * head(sound)(t), tail(sound));
}

// play changed sound with background music
function play_it(sound, change, bgm) {
    play(play_with_bgm(change_volume(bgm, 0.3), change(sound)));
}

function play_with_bgm(bgm, ss2) {
    var dur1 = tail(bgm);
    var dur2 = tail(ss2);
    while(dur1<dur2){
        bgm = consecutively(list(bgm,bgm));
        dur1 = tail(bgm);
    }
    var wave1 = head(bgm);
    var wave2 = head(ss2);
    // new_wave assumes sound discipline (ie, wave(t) = 0 after t > dur)
    var new_wave = t => wave1(t) + wave2(t);
    // new_dur is higher of the two dur
    var new_dur = dur1 < dur2 ? dur1 : dur2;
    return pair(new_wave, new_dur);
}

// To record sound,run
// const stop = record_start();
// and seconds later run
// record_stop(stop)    
function record_start() {
    return record(0.5);
}
function record_stop(stop){
    return stop();
}

/* some bgm */
function bgm_silence(){
    return silence_sound(1);
}
function bgm_Children_Song(){
    return consecutively(list(
        piano(72,0.3),piano(72,0.3),piano(79,0.3),piano(79,0.3),piano(81,0.3),piano(81,0.3),piano(79,0.5),
        piano(77,0.3),piano(77,0.3),piano(76,0.3),piano(76,0.3),piano(74,0.3),piano(74,0.3),piano(72,0.5),
        piano(79,0.3),piano(79,0.3),piano(77,0.3),piano(77,0.3),piano(76,0.3),piano(76,0.3),piano(74,0.5),
        piano(79,0.3),piano(79,0.3),piano(77,0.3),piano(77,0.3),piano(76,0.3),piano(76,0.3),piano(74,0.5),
        piano(72,0.3),piano(72,0.4),piano(79,0.4),piano(79,0.4),piano(81,0.4),piano(81,0.4),piano(79,0.5),
        piano(77,0.3),piano(77,0.4),piano(76,0.5),piano(76,0.5),piano(74,0.5),piano(74,0.5),piano(72,0.7)
   ));
}

function bgm_celebrate(){
    return consecutively(list(
        piano(79,0.3),piano(79,0.3),piano(81,0.5),piano(79,0.5),piano(84,0.5),piano(83,0.7),
        piano(79,0.3),piano(79,0.3),piano(81,0.5),piano(79,0.5),piano(86,0.5),piano(84,0.7),
        piano(79,0.3),piano(79,0.3),piano(91,0.5),piano(88,0.5),piano(84,0.5),piano(83,0.5),piano(81,0.7),
        piano(89,0.3),piano(89,0.3),piano(88,0.5),piano(84,0.5),piano(86,0.5),piano(84,0.7)
  ));
}

function bgm_lyric(){
    return consecutively(list(
        violin(72,0.3),violin(72,0.3),violin(74,0.3),violin(76,0.3),violin(76,0.3),violin(77,0.3),violin(79,0.3),
        violin(81,0.3),violin(79,0.3),violin(76,0.7),violin(79,0.3),violin(77,0.3),violin(76,0.3),violin(74,0.6),
        violin(77,0.3),violin(76,0.3),violin(74,0.3),violin(72,0.6),violin(72,0.3),violin(72,0.3),violin(74,0.3),
        violin(76,0.3),violin(76,0.3),violin(77,0.3),violin(79,0.3),violin(81,0.3),violin(79,0.3),violin(76,0.7),
        violin(79,0.3),violin(77,0.3),violin(76,0.3),violin(74,0.3),violin(76,0.3),violin(74,0.3),violin(72,0.6)
   ));
}

function bgm_classical(){
    return consecutively(list(
        violin(88,0.3),violin(86,0.3),violin(88,0.3),violin(86,0.3),violin(88,0.3),violin(83,0.3),violin(86,0.3),
        violin(84,0.3),violin(81,0.7),violin(72,0.3),violin(76,0.3),violin(81,0.3),violin(83,0.7),violin(76,0.3),
        violin(79,0.3),violin(83,0.3),violin(84,1),violin(88,0.3),violin(86,0.3),violin(88,0.3),violin(86,0.3),
        violin(88,0.3),violin(83,0.3),violin(86,0.3),violin(84,0.3),violin(81,0.7),violin(72,0.3),violin(76,0.3),
        violin(81,0.3),violin(83,0.7),violin(76,0.3),violin(79,0.3),violin(83,0.3),violin(81,1)
    ));
}

function bgm_folk(){
    return consecutively(list(
        piano(74,0.5),piano(79,0.5),piano(76,0.3),piano(74,0.3),piano(76,0.3),piano(76,0.3),
        piano(79,0.3),piano(76,0.3),piano(74,0.3),piano(72,0.3),piano(74,0.6),piano(74,0.6),
        piano(74,0.6),piano(79,0.6),piano(74,0.3),piano(74,0.3),piano(76,0.3),piano(79,0.3),
        piano(76,0.3),piano(74,0.3),piano(72,0.3),piano(69,0.3),piano(72,0.5),piano(72,0.5),
        piano(72,0.5),piano(76,0.5),piano(74,0.3),piano(76,0.3),piano(65,0.3),piano(65,0.3),
        piano(72,0.3),piano(74,0.3),piano(69,0.3),piano(67,0.3),piano(69,0.6),piano(69,0.6),
        piano(72,0.3),piano(72,0.3),piano(72,0.3),piano(74,0.3),piano(69,0.3),piano(67,0.3),
        piano(67,0.3),piano(64,0.3),piano(67,1)
    ));
}

function bgm_Country_Side(){
    return c_major_scale_sound;
}

/* some function to change sound */
function change_nochange(sound) {
    return sound;
}
function change_fatBoy(sound){
    const new_wave = t=> get_wave(sound)(t*0.8);
    return make_sound(new_wave,get_duration(sound)*(5/4));
}

function change_valleyEcho(sound){
    return simultaneously(list(pair(t => 1.5 * (head(sound)(t)), tail(sound)),
                              pair(t => t < 0.3 ?0 :0.5*(head(sound)((t-0.3))), tail(sound) + 0.3),
                              pair(t => t < 0.5 ?0 :0.4*(head(sound)((t-0.5))), tail(sound) + 0.5),
                              pair(t => t < 0.7 ?0 :0.3*(head(sound)((t-0.7))), tail(sound) + 0.7),
                              pair(t => t < 0.8 ?0 :0.2*(head(sound)((t-0.8))), tail(sound) + 0.8),
                              pair(t => t < 0.9 ?0 :0.1*(head(sound)((t-0.9))), tail(sound) + 0.9)));
}

function change_cuteMonster(sound){
    return pair(t => head(sound)(1.4 * t), tail(sound));
}

function change_backInTime(sound){
    const w = get_wave(sound);
    const d = get_duration(sound);
    return make_sound(t => w(d - t), d);
}

let bgms = [bgm_silence(), bgm_silence(), bgm_celebrate(), bgm_folk(), bgm_Children_Song(), bgm_lyric(), bgm_classical()];
let changes = [change_nochange, change_nochange, change_fatBoy, change_backInTime, change_valleyEcho, change_cuteMonster, change_fatBoy];
/*****************************************************************************/


// list.js: Supporting lists in the Scheme style, using pairs made
//          up of two-element JavaScript array (vector)

// Author: Martin Henz

// array test works differently for Rhino and
// the Firefox environment (especially Web Console)
function array_test(x) {
  if (Array.isArray === undefined) {
    return x instanceof Array
  } else {
    return Array.isArray(x)
  }
}

// pair constructs a pair using a two-element array
// LOW-LEVEL FUNCTION, NOT SOURCE
function pair(x, xs) {
  return [x, xs]
}

// is_pair returns true iff arg is a two-element array
// LOW-LEVEL FUNCTION, NOT SOURCE
function is_pair(x) {
  return array_test(x) && x.length === 2
}

// head returns the first component of the given pair,
// throws an exception if the argument is not a pair
// LOW-LEVEL FUNCTION, NOT SOURCE
function head(xs) {
  if (is_pair(xs)) {
    return xs[0]
  } else {
    throw new Error('head(xs) expects a pair as argument xs, but encountered ' + xs)
  }
}

// tail returns the second component of the given pair
// throws an exception if the argument is not a pair
// LOW-LEVEL FUNCTION, NOT SOURCE
function tail(xs) {
  if (is_pair(xs)) {
    return xs[1]
  } else {
    throw new Error('tail(xs) expects a pair as argument xs, but encountered ' + xs)
  }
}

// is_null returns true if arg is exactly null
// LOW-LEVEL FUNCTION, NOT SOURCE
function is_null(xs) {
  return xs === null
}

// is_list recurses down the list and checks that it ends with the empty list []
// does not throw Value exceptions
// LOW-LEVEL FUNCTION, NOT SOURCE
function is_list(xs) {
  for (; ; xs = tail(xs)) {
    if (is_null(xs)) {
      return true
    } else if (!is_pair(xs)) {
      return false
    }
  }
}

// list makes a list out of its arguments
// LOW-LEVEL FUNCTION, NOT SOURCE
function list() {
  let the_list = null
  for (let i = arguments.length - 1; i >= 0; i--) {
    the_list = pair(arguments[i], the_list)
  }
  return the_list
}

// list_to_vector returns vector that contains the elements of the argument list
// in the given order.
// list_to_vector throws an exception if the argument is not a list
// LOW-LEVEL FUNCTION, NOT SOURCE
function list_to_vector(lst) {
  const vector = []
  while (!is_null(lst)) {
    vector.push(head(lst))
    lst = tail(lst)
  }
  return vector
}

// vector_to_list returns a list that contains the elements of the argument vector
// in the given order.
// vector_to_list throws an exception if the argument is not a vector
// LOW-LEVEL FUNCTION, NOT SOURCE
function vector_to_list(vector) {
  let result = null
  for (let i = vector.length - 1; i >= 0; i = i - 1) {
    result = pair(vector[i], result)
  }
  return result
}

// returns the length of a given argument list
// throws an exception if the argument is not a list
function length(xs) {
  let i = 0
  while (!is_null(xs)) {
    i += 1
    xs = tail(xs)
  }
  return i
}

// map applies first arg f to the elements of the second argument,
// assumed to be a list.
// f is applied element-by-element:
// map(f,[1,[2,[]]]) results in [f(1),[f(2),[]]]
// map throws an exception if the second argument is not a list,
// and if the second argument is a non-empty list and the first
// argument is not a function.
// tslint:disable-next-line:ban-types
function map(f, xs) {
  return is_null(xs) ? null : pair(f(head(xs)), map(f, tail(xs)))
}

// build_list takes a non-negative integer n as first argument,
// and a function fun as second argument.
// build_list returns a list of n elements, that results from
// applying fun to the numbers from 0 to n-1.
// tslint:disable-next-line:ban-types
function build_list(n, fun) {
  if (typeof n !== 'number' || n < 0 || Math.floor(n) !== n) {
    throw new Error(
      'build_list(n, fun) expects a positive integer as ' + 'argument n, but encountered ' + n
    )
  }

  // tslint:disable-next-line:ban-types
  function build(i, alreadyBuilt) {
    if (i < 0) {
      return alreadyBuilt
    } else {
      return build(i - 1, pair(fun(i), alreadyBuilt))
    }
  }

  return build(n - 1, null)
}

// for_each applies first arg fun to the elements of the list passed as
// second argument. fun is applied element-by-element:
// for_each(fun,[1,[2,[]]]) results in the calls fun(1) and fun(2).
// for_each returns true.
// for_each throws an exception if the second argument is not a list,
// and if the second argument is a non-empty list and the
// first argument is not a function.
// tslint:disable-next-line:ban-types
function for_each(fun, xs) {
  if (!is_list(xs)) {
    throw new Error('for_each expects a list as argument xs, but encountered ' + xs)
  }
  for (; !is_null(xs); xs = tail(xs)) {
    fun(head(xs))
  }
  return true
}

// reverse reverses the argument list
// reverse throws an exception if the argument is not a list.
function reverse(xs) {
  if (!is_list(xs)) {
    throw new Error('reverse(xs) expects a list as argument xs, but encountered ' + xs)
  }
  let result = null
  for (; !is_null(xs); xs = tail(xs)) {
    result = pair(head(xs), result)
  }
  return result
}

// append first argument list and second argument list.
// In the result, the [] at the end of the first argument list
// is replaced by the second argument list
// append throws an exception if the first argument is not a list
function append(xs, ys) {
  if (is_null(xs)) {
    return ys
  } else {
    return pair(head(xs), append(tail(xs), ys))
  }
}

// member looks for a given first-argument element in a given
// second argument list. It returns the first postfix sublist
// that starts with the given element. It returns [] if the
// element does not occur in the list
function member(v, xs) {
  for (; !is_null(xs); xs = tail(xs)) {
    if (head(xs) === v) {
      return xs
    }
  }
  return null
}

// removes the first occurrence of a given first-argument element
// in a given second-argument list. Returns the original list
// if there is no occurrence.
function remove(v, xs) {
  if (is_null(xs)) {
    return null
  } else {
    if (v === head(xs)) {
      return tail(xs)
    } else {
      return pair(head(xs), remove(v, tail(xs)))
    }
  }
}

// Similar to remove. But removes all instances of v instead of just the first
function remove_all(v, xs) {
  if (is_null(xs)) {
    return null
  } else {
    if (v === head(xs)) {
      return remove_all(v, tail(xs))
    } else {
      return pair(head(xs), remove_all(v, tail(xs)))
    }
  }
}

// for backwards-compatibility
// equal computes the structural equality
// over its arguments
function equal(item1, item2) {
  if (is_pair(item1) && is_pair(item2)) {
    return equal(head(item1), head(item2)) && equal(tail(item1), tail(item2))
  } else {
    return item1 === item2
  }
}

// assoc treats the second argument as an association,
// a list of (index,value) pairs.
// assoc returns the first (index,value) pair whose
// index equal (using structural equality) to the given
// first argument v. Returns false if there is no such
// pair
function assoc(v, xs) {
  if (is_null(xs)) {
    return false
  } else if (equal(v, head(head(xs)))) {
    return head(xs)
  } else {
    return assoc(v, tail(xs))
  }
}

// filter returns the sublist of elements of given list xs
// for which the given predicate function returns true.
// tslint:disable-next-line:ban-types
function filter(pred, xs) {
  if (is_null(xs)) {
    return xs
  } else {
    if (pred(head(xs))) {
      return pair(head(xs), filter(pred, tail(xs)))
    } else {
      return filter(pred, tail(xs))
    }
  }
}

// enumerates numbers starting from start,
// using a step size of 1, until the number
// exceeds end.
function enum_list(start, end) {
  if (typeof start !== 'number') {
    throw new Error(
      'enum_list(start, end) expects a number as argument start, but encountered ' + start
    )
  }
  if (typeof end !== 'number') {
    throw new Error(
      'enum_list(start, end) expects a number as argument start, but encountered ' + end
    )
  }
  if (start > end) {
    return null
  } else {
    return pair(start, enum_list(start + 1, end))
  }
}

// Returns the item in list lst at index n (the first item is at position 0)
function list_ref(xs, n) {
  if (typeof n !== 'number' || n < 0 || Math.floor(n) !== n) {
    throw new Error(
      'list_ref(xs, n) expects a positive integer as argument n, but encountered ' + n
    )
  }
  for (; n > 0; --n) {
    xs = tail(xs)
  }
  return head(xs)
}

// accumulate applies given operation op to elements of a list
// in a right-to-left order, first apply op to the last element
// and an initial element, resulting in r1, then to the
// second-last element and r1, resulting in r2, etc, and finally
// to the first element and r_n-1, where n is the length of the
// list.
// accumulate(op,zero,list(1,2,3)) results in
// op(1, op(2, op(3, zero)))
function accumulate(op, initial, sequence) {
  if (is_null(sequence)) {
    return initial
  } else {
    return op(head(sequence), accumulate(op, initial, tail(sequence)))
  }
}

// set_head(xs,x) changes the head of given pair xs to be x,
// throws an exception if the argument is not a pair
// LOW-LEVEL FUNCTION, NOT SOURCE
function set_head(xs, x) {
  if (is_pair(xs)) {
    xs[0] = x
    return undefined
  } else {
    throw new Error('set_head(xs,x) expects a pair as argument xs, but encountered ' + xs)
  }
}

// set_tail(xs,x) changes the tail of given pair xs to be x,
// throws an exception if the argument is not a pair
// LOW-LEVEL FUNCTION, NOT SOURCE
function set_tail(xs, x) {
  if (is_pair(xs)) {
    xs[1] = x
    return undefined
  } else {
    throw new Error('set_tail(xs,x) expects a pair as argument xs, but encountered ' + xs)
  }
}

/* end of list.js and begin of sounds.js */
// Constants
var FS = 44100; // Standard sampling rate for all problems

const fourier_expansion_level = 5; // expansion level for
                                   // square, sawtooth, triangle

// ---------------------------------------------
// Fast reimplementations of the list library
// ---------------------------------------------
function vector_to_list(arr) {
    var xs = [];

    for (var i=arr.length-1; i>=0; i--) {
        xs = pair(arr[i], xs);
    }

    return xs;
}

function list_to_vector(xs) {
    var vector = [];

    while(!is_null(xs)) {
        vector.push(head(xs));
        xs = tail(xs);
    }

    return vector;
}

function length(xs) {
    var len = 0;
    while(!is_null(xs)) {
        len++;
        xs = tail(xs);
    }
    return len;
}

function append(xs, ys) {
    var v1 = list_to_vector(xs);
    var v2 = list_to_vector(ys);
    var vector = v1.concat(v2);
    return vector_to_list(vector);
}

function map(f, xs) {
    var vector = list_to_vector(xs);
    for (var i=0; i<vector.length; i++) {
        vector[i] = f(vector[i]);
    }
    return vector_to_list(vector);
}

// ---------------------------------------------
// Low-level sound support
// ---------------------------------------------

// Samples a continuous wave to a discrete waves at sampling rate for duration
// in seconds
function discretize(wave, duration) {
    var vector = [];

    for (var i = 0; i < duration * FS; i++) {
        vector.push(wave( i / FS));
    }

    return vector;
}

// Discretizes a sound to a sound starting from elapsed_duration, for
// sample_length seconds
function discretize_from(wave, duration, elapsed_duration, sample_length, data) {
    if (elapsed_duration + sample_length > duration) {
        for (var i = elapsed_duration * FS; i < duration * FS; i++) {
            data[i - elapsed_duration * FS] = wave(i / FS);
        }
        return data;
    } else if (duration - elapsed_duration > 0) {
        for (var i = elapsed_duration * FS;
	     i < (elapsed_duration + sample_length) * FS;
	     i++) {
            data[i - elapsed_duration * FS] = wave(i / FS);
        }
        return data;
    }
}

// Quantize real amplitude values into standard 4-bit PCM levels
function quantize(data) {
    for (var i = 0; i < data.length; i++) {
        data[i] = Math.round((data[i] + 1) * 126);
    }
    return data;
}

// Try to eliminate clicks by smoothening out sudden jumps at the end of a wave
function simple_filter(data) {
    for (var i = 0; i < data.length; i++) {
        if (data[i] > 1) {
          data[i] = 1;
        }
        if (data[i] < -1) {
          data[i] = -1;
        }
    }
    var old_value = 0;
    for (var i = 0; i < data.length; i++) {
        if (Math.abs(old_value - data[i]) > 0.01 && data[i] == 0) {
            data[i] = old_value * 0.999;
        }
        old_value = data[i];
    }
    return data;
}

function copy(data) {
    var ret = [];
    for (var i = 0; i < data.length; i++) {
        ret[i] = data[i];
    }
    return ret;
}

// Raw data to html5 audio element
function raw_to_audio(_data) {
    data = copy(_data);
    data = simple_filter(data);
    data = quantize(data);
    var riffwave = new RIFFWAVE();
    riffwave.header.sampleRate = FS;
    riffwave.header.numChannels = 1;
    riffwave.Make(data);
    var audio = new Audio(riffwave.dataURI);
    return audio;
}

// ---------------------------------------------
// Source API for Students
// ---------------------------------------------

// Data abstractions:
// time: real value in seconds  x > 0
// amplitude: real value -1 <= x <= 1
// duration: real value in seconds 0 < x < Infinity
// sound: (time -> amplitude) x duration

/**
 * Makes a sound from a wave and a duration.
 * The wave is a function from time (in seconds)
 * to an amplitude value that should lie between
 * -1 and 1. The duration is given in seconds.
 * @param {function} wave - given wave function
 * @param {number} duration - in seconds
 * @returns {sound} 
 */
function make_sound(wave, duration) {
    return pair(t => t >= duration ? 0 : wave(t), duration);
}

/**
 * Accesses the wave of a sound.
 * The wave is a function from time (in seconds)
 * to an amplitude value that should lie between
 * -1 and 1.
 * @param {sound} sound - given sound
 * @returns {function} wave function of the sound
 */
function get_wave(sound) {
    return head(sound);
}

/**
 * Accesses the duration of a sound, in seconds.
 * @param {sound} sound - given sound
 * @returns {number} duration in seconds
 */
function get_duration(sound) {
    return tail(sound);
}

/**
 * Checks if a given value is a sound
 * @param {value} x - given value
 * @returns {boolean} whether <CODE>x</CODE> is a sound
 */
function is_sound(x) {
    return is_pair(x) &&
    ((typeof get_wave(x)) === 'function') &&
    ((typeof get_duration(x)) === 'number');
}

// Keeps track of whether play() is currently running,
// and the current audio context.
var _playing = false;
var _player;

function play_unsafe(sound) {
    // type-check sound
    if ( !is_sound(sound) ) {
	throw new Error("play is expecting sound, but encountered " + sound);
    }	
    
    // Declaring duration and wave variables
    var wave = get_wave(sound);
    var duration = get_duration(sound);

    // If a sound is already playing, terminate execution
    if (_playing) {
	throw new Error("play: audio system still playing previous sound");
    }
    
    _playing = true;

    // Create AudioContext (test this out might fix safari issue)
    //const AudioContext = window.AudioContext || window.webkitAudioContext;
    
    // Main audio context
    _player = new AudioContext();

    // Controls Length of buffer in seconds.
    var buffer_length = 0.1;

    // Define Buffer Size
    var bufferSize = FS * buffer_length;

    // Create two buffers
    var buffer1 = _player.createBuffer(1, bufferSize, FS);
    var buffer2 = _player.createBuffer(1, bufferSize, FS);

    // Keep track of elapsed_duration & first run of ping_pong
    var elapsed_duration = 0;
    var first_run = true;

    // Schedules playback of sounds
    function ping_pong(current_sound, next_sound, current_buffer, next_buffer) {
        // If sound has exceeded duration, early return to stop calls.
        if (elapsed_duration > duration || !_playing) { 
            stop();
            return;
        }

        // Fill current_buffer, then play current_sound.
        if (first_run) {
            // No longer first run of ping_pong.
            first_run = false;

            // Discretize first chunk, load into current_buffer.
            let current_data = current_buffer.getChannelData(0);
            current_data = discretize_from(wave, duration, elapsed_duration,
					   buffer_length, current_data);

            // Create current_sound.
            current_sound = new AudioBufferSourceNode(_player);

            // Set current_sound's buffer to current_buffer.
            current_sound.buffer = current_buffer;

            // Play current_sound.
            current_sound.connect(_player.destination);
            current_sound.start();

            // Increment elapsed duration.
            elapsed_duration += buffer_length;
        }

        // Fill next_buffer while current_sound is playing,
	// schedule next_sound to play after current_sound terminates.

        // Discretize next chunk, load into next_buffer.
        let next_data = next_buffer.getChannelData(0);
        next_data = discretize_from(wave, duration, elapsed_duration,
				    buffer_length, next_data);

        // Create next_sound.
        next_sound = new AudioBufferSourceNode(_player);

        // Set next_sound's buffer to next_buffer.
        next_sound.buffer = next_buffer;

        // Schedule next_sound to play after current_sound.
        next_sound.connect(_player.destination);
        next_sound.start(start_time + elapsed_duration);

        // Increment elapsed duration.
        elapsed_duration += buffer_length;

        current_sound.onended =
	    event => 
            ping_pong(next_sound, current_sound, next_buffer, current_buffer);
    }
    var start_time = _player.currentTime;
    ping_pong(null, null, buffer1, buffer2);
    return sound;
}

// "Safe" playing for overly complex sounds.
// Discretizes full sound before playing
// (i.e. plays sound properly, but possibly with
// a delay).
var _safeplaying = false;
var _safeaudio = null;

/**
 * plays a given sound using your computer's sound device
 * @param {sound} sound - given sound
 * @returns {undefined} undefined
 */
function play(sound) {
    // If a sound is already playing, terminate execution.
    if (_safeplaying || _playing) return;
    // Discretize the input sound
    var data = discretize(get_wave(sound), get_duration(sound));
    _safeaudio = raw_to_audio(data);

    _safeaudio.addEventListener('ended', stop);
    _safeaudio.play();
    _safeplaying = true;
}

/* sound_to_string and string_to_sound would be really cool!!!

function sound_to_string(sound) {
    let discretized_wave = discretize(wave(sound), duration(sound));
    let discretized_sound = pair(discretized_wave, duration(sound));
    return stringify(pair(data), tail(sound));
}

function string_to_sound(str) {
    var discretized_sound = eval(str);
    
    return pair(t => ..., duration(data));
}
*/

/**
 * Stops playing the current sound
 * @returns {undefined} undefined
 */
function stop() {
    // If using normal play()
    if (_playing) {
        _player.close();
    }
    // If using play_safe()
    if (_safeplaying) {
        _safeaudio.pause();
        _safeaudio = null;
    }
    _playing = false;
    _safeplaying = false;
}

// Concats a list of sounds
/**
 * makes a new sound by combining the sounds in a given
 * list so that
 * they play consecutively, each next sound starting when the
 * previous sound ends
 * @param {list_of_sounds} sounds - given list of sounds
 * @returns {sound} resulting sound
 */
function consecutively(list_of_sounds) {
    function consec_two(ss1, ss2) {
        var wave1 = head(ss1);
        var wave2 = head(ss2);
        var dur1 = tail(ss1);
        var dur2 = tail(ss2);
        var new_wave = t => t < dur1 ? wave1(t) : wave2(t - dur1);
        return pair(new_wave, dur1 + dur2);
    }
    return accumulate(consec_two, silence_sound(0), list_of_sounds);
}

// Mushes a list of sounds together
/**
 * makes a new sound by combining the sounds in a given
 * list so that
 * they play simutaneously, all starting at the beginning of the 
 * resulting sound
 * @param {list_of_sounds} sounds - given list of sounds
 * @returns {sound} resulting sound
 */
function simultaneously(list_of_sounds) {
    function musher(ss1, ss2) {
        var wave1 = head(ss1);
        var wave2 = head(ss2);
        var dur1 = tail(ss1);
        var dur2 = tail(ss2);
        // new_wave assumes sound discipline (ie, wave(t) = 0 after t > dur)
        var new_wave = t => wave1(t) + wave2(t);
        // new_dur is higher of the two dur
        var new_dur = dur1 < dur2 ? dur2 : dur1;
        return pair(new_wave, new_dur);
    }

    var mushed_sounds = accumulate(musher, silence_sound(0), list_of_sounds);
    var normalised_wave =  t =>
	(head(mushed_sounds))(t) / length(list_of_sounds);
    var highest_duration = tail(mushed_sounds);
    return pair(normalised_wave, highest_duration);
}

/**
 * makes a sound of a given duration by randomly
 * generating amplitude values
 * @param {number} duration - duration of result sound, in seconds
 * @returns {sound} resulting noise sound
 */
function noise_sound(duration) {
    return make_sound(t => Math.random() * 2 - 1, duration);
}

/**
 * makes a sine wave sound with given frequency and a given duration
 * @param {number} freq - frequency of result sound, in Hz
 * @param {number} duration - duration of result sound, in seconds
 * @returns {sound} resulting sine sound
 */
function sine_sound(freq, duration) {
    return make_sound(t => Math.sin(2 * Math.PI * t * freq), duration);
}

/**
 * makes a silence sound with a given duration
 * @param {number} duration - duration of result sound, in seconds
 * @returns {sound} resulting silence sound
 */
function silence_sound(duration) {
    return make_sound(t => 0, duration);
}

// for mission 14

/**
 * converts a letter name <CODE>str</CODE> to corresponding midi note.
 * Examples for letter names are <CODE>"A5"</CODE>, <CODE>"B3"</CODE>, <CODE>"D#4"</CODE>.
 * See <a href="https://i.imgur.com/qGQgmYr.png">mapping from
 * letter name to midi notes</a>
 * @param {string} str - given letter name
 * @returns {number} midi value of the corresponding note
 */
function letter_name_to_midi_note(note) {
    // we don't consider double flat/ double sharp
    var note = note.split("");
    var res = 12; //MIDI notes for mysterious C0
    var n = note[0].toUpperCase();
    switch(n) {
        case 'D': 
            res = res + 2;
            break;

        case 'E': 
            res = res + 4;
            break;

        case 'F': 
            res = res + 5;
            break;

        case 'G': 
            res = res + 7;
            break;

        case 'A': 
            res = res + 9;
            break;

        case 'B': 
            res = res + 11;
            break;

        default :
            break;
    }

    if (note.length === 2) {
        res = parseInt(note[1]) * 12 + res;
    } else if (note.length === 3) {
        switch (note[1]) {
            case '#':
                res = res + 1;
                break;

            case 'b':
                res = res - 1;
                break;

            default:
                break;
        }
        res = parseInt(note[2]) * 12 + res;
    }

    return res;
}


/**
 * converts a letter name <CODE>str</CODE> to corresponding frequency.
 * First converts <CODE>str</CODE> to a note using <CODE>letter_name_to_midi_note</CODE>
 * and then to a frequency using <CODE>midi_note_to_frequency</CODE>
 * @param {string} str - given letter name
 * @returns {number} frequency of corresponding note in Hz
 */
function letter_name_to_frequency(note) {
    return midi_note_to_frequency(note_to_midi_note(note));
}

/**
 * converts a midi note <CODE>n</CODE> to corresponding frequency.
 * The note is given as an integer number.
 * @param {number} n - given midi note
 * @returns {number} frequency of the note in Hz
 */
function midi_note_to_frequency(note) {
    return 8.1757989156 * Math.pow(2, (note / 12));
}

/**
 * makes a square wave sound with given frequency and a given duration
 * @param {number} freq - frequency of result sound, in Hz
 * @param {number} duration - duration of result sound, in seconds
 * @returns {sound} resulting square sound
 */
function square_sound(freq, duration) {
    function fourier_expansion_square(t) {
        var answer = 0;
        for (var i = 1; i <= fourier_expansion_level; i++) {
            answer = answer +
		Math.sin(2 * Math.PI * (2 * i - 1) * freq * t)
		/
		(2 * i - 1);
        }
        return answer;
    }
    return make_sound(t => 
        (4 / Math.PI) * fourier_expansion_square(t),
        duration);
}

/**
 * makes a triangle wave sound with given frequency and a given duration
 * @param {number} freq - frequency of result sound, in Hz
 * @param {number} duration - duration of result sound, in seconds
 * @returns {sound} resulting triangle sound
 */
function triangle_sound(freq, duration) {
    function fourier_expansion_triangle(t) {
        var answer = 0;
        for (var i = 0; i < fourier_expansion_level; i++) {
            answer = answer +
		Math.pow(-1, i) *
		Math.sin((2 * i + 1) * t * freq * Math.PI * 2)
		/
		Math.pow((2 * i + 1), 2);
        }
        return answer;
    }
    return make_sound(t => 
        (8 / Math.PI / Math.PI) * fourier_expansion_triangle(t),
        duration);
}

/**
 * makes a sawtooth wave sound with given frequency and a given duration
 * @param {number} freq - frequency of result sound, in Hz
 * @param {number} duration - duration of result sound, in seconds
 * @returns {sound} resulting sawtooth sound
 */
function sawtooth_sound(freq, duration) {
    function fourier_expansion_sawtooth(t) {
        var answer = 0;
        for (var i = 1; i <= fourier_expansion_level; i++) {
            answer = answer + Math.sin(2 * Math.PI * i * freq * t) / i;
        }
        return answer;
    }
    return make_sound(t =>
		      (1 / 2) - (1 / Math.PI) * fourier_expansion_sawtooth(t),
		      duration);
}

function change_sound(sound, a, b, dt) {
    return tail(sound) > dt
        ? consecutively(list(pair(t => t <= dt? a( head(sound)(b(t)) ) : 0, dt), 
		change_sound(make_sound(t => head(sound)(t+dt), tail(sound) - dt), a, b, dt)))
		: pair(t => a( head(sound)(b(t)) ), tail(sound));
}
/* end of sounds.js*/

/* 
 * RIFFWAVE.js v0.03 - Audio encoder for HTML5 <audio> elements.
 * Copyleft 2011 by Pedro Ladaria <pedro.ladaria at Gmail dot com>
 *
 * Public Domain
 *
 * Changelog:
 *
 * 0.01 - First release
 * 0.02 - New faster base64 encoding
 * 0.03 - Support for 16bit samples
 *
 * Notes:
 *
 * 8 bit data is unsigned: 0..255
 * 16 bit data is signed: −32,768..32,767
 *
 */

var FastBase64 = {
  chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
  encLookup: [],

  Init: function() {
    for (var i = 0; i < 4096; i++) {
      this.encLookup[i] = this.chars[i >> 6] + this.chars[i & 0x3f]
    }
  },

  Encode: function(src) {
    var len = src.length
    var dst = ''
    var i = 0
    while (len > 2) {
      n = (src[i] << 16) | (src[i + 1] << 8) | src[i + 2]
      dst += this.encLookup[n >> 12] + this.encLookup[n & 0xfff]
      len -= 3
      i += 3
    }
    if (len > 0) {
      var n1 = (src[i] & 0xfc) >> 2
      var n2 = (src[i] & 0x03) << 4
      if (len > 1) n2 |= (src[++i] & 0xf0) >> 4
      dst += this.chars[n1]
      dst += this.chars[n2]
      if (len == 2) {
        var n3 = (src[i++] & 0x0f) << 2
        n3 |= (src[i] & 0xc0) >> 6
        dst += this.chars[n3]
      }
      if (len == 1) dst += '='
      dst += '='
    }
    return dst
  } // end Encode
}

FastBase64.Init()

var RIFFWAVE = function(data) {
  this.data = [] // Array containing audio samples
  this.wav = [] // Array containing the generated wave file
  this.dataURI = '' // http://en.wikipedia.org/wiki/Data_URI_scheme

  this.header = {
    // OFFS SIZE NOTES
    chunkId: [0x52, 0x49, 0x46, 0x46], // 0    4    "RIFF" = 0x52494646
    chunkSize: 0, // 4    4    36+SubChunk2Size = 4+(8+SubChunk1Size)+(8+SubChunk2Size)
    format: [0x57, 0x41, 0x56, 0x45], // 8    4    "WAVE" = 0x57415645
    subChunk1Id: [0x66, 0x6d, 0x74, 0x20], // 12   4    "fmt " = 0x666d7420
    subChunk1Size: 16, // 16   4    16 for PCM
    audioFormat: 1, // 20   2    PCM = 1
    numChannels: 1, // 22   2    Mono = 1, Stereo = 2...
    sampleRate: 8000, // 24   4    8000, 44100...
    byteRate: 0, // 28   4    SampleRate*NumChannels*BitsPerSample/8
    blockAlign: 0, // 32   2    NumChannels*BitsPerSample/8
    bitsPerSample: 8, // 34   2    8 bits = 8, 16 bits = 16
    subChunk2Id: [0x64, 0x61, 0x74, 0x61], // 36   4    "data" = 0x64617461
    subChunk2Size: 0 // 40   4    data size = NumSamples*NumChannels*BitsPerSample/8
  }

  function u32ToArray(i) {
    return [i & 0xff, (i >> 8) & 0xff, (i >> 16) & 0xff, (i >> 24) & 0xff]
  }

  function u16ToArray(i) {
    return [i & 0xff, (i >> 8) & 0xff]
  }

  function split16bitArray(data) {
    var r = []
    var j = 0
    var len = data.length
    for (var i = 0; i < len; i++) {
      r[j++] = data[i] & 0xff
      r[j++] = (data[i] >> 8) & 0xff
    }
    return r
  }

  this.Make = function(data) {
    if (data instanceof Array) this.data = data
    this.header.blockAlign = (this.header.numChannels * this.header.bitsPerSample) >> 3
    this.header.byteRate = this.header.blockAlign * this.sampleRate
    this.header.subChunk2Size = this.data.length * (this.header.bitsPerSample >> 3)
    this.header.chunkSize = 36 + this.header.subChunk2Size

    this.wav = this.header.chunkId.concat(
      u32ToArray(this.header.chunkSize),
      this.header.format,
      this.header.subChunk1Id,
      u32ToArray(this.header.subChunk1Size),
      u16ToArray(this.header.audioFormat),
      u16ToArray(this.header.numChannels),
      u32ToArray(this.header.sampleRate),
      u32ToArray(this.header.byteRate),
      u16ToArray(this.header.blockAlign),
      u16ToArray(this.header.bitsPerSample),
      this.header.subChunk2Id,
      u32ToArray(this.header.subChunk2Size),
      this.header.bitsPerSample == 16 ? split16bitArray(this.data) : this.data
    )
    this.dataURI = 'data:audio/wav;base64,' + FastBase64.Encode(this.wav)
  }

  if (data instanceof Array) this.Make(data)
} // end RIFFWAVE

/* microphone.js */
// // ---------------------------------------------
// // Microphone Functionality
// // ---------------------------------------------

// permission initially undefined
// set to true by granting microphone permission
// set to false by denying microphone permission
let permission = undefined;

let recorded_sound = undefined;

// check_permission is called whenever we try
// to record a sound
function check_permission() {
    if (permission === undefined) {
	throw new Error("Call init_record(); " +
		    "to obtain permission to use microphone");
    } else if (permission === false) {
	throw new Error("Permission has been denied.\n" +
		    "Re-start browser and call init_record();\n" +
		    "to obtain permission to use microphone.");
    } // (permission === true): do nothing
}

/**
 * Initialize recording by obtaining permission
 * to use the default device microphone
 * @returns {undefined} 
 */
function init_record(){
    navigator.mediaDevices.getUserMedia({ audio: true })
	.then(rememberStream, setPermissionToFalse);
    return "obtaining recording permission";
}

let globalStream;

function rememberStream(stream) {
    permission = true;	
    globalStream = stream;
}

function setPermissionToFalse() {
    permission = false;	
}

function start_recording(mediaRecorder) {
    const data = [];
    mediaRecorder.ondataavailable = e => e.data.size && data.push(e.data);
    mediaRecorder.start(); 
    mediaRecorder.onstop = () => process(data);
}

// there is a beep signal at the beginning and end
// of each recording
const recording_signal_duration_ms = 300;

function play_recording_signal() {
    play(sine_sound(500, recording_signal_duration_ms / 1000));
}

/**
 * takes a <CODE>buffer</CODE> duration (in seconds) as argument, and
 * returns a nullary stop function <CODE>stop</CODE>. A call
 * <CODE>stop()</CODE> returns a sound promise: a nullary function
 * that returns a sound. Example: <PRE><CODE>init_record();
 * const stop = record(0.5);
 * // record after 0.5 seconds. Then in next query:
 * const promise = stop();
 * // In next query, you can play the promised sound, by
 * // applying the promise:
 * play(promise());</CODE></PRE>
 * @param {number} buffer - pause before recording, in seconds
 * @returns {function} nullary <CODE>stop</CODE> function;
 * <CODE>stop()</CODE> stops the recording and 
 * returns a sound promise: a nullary function that returns the recorded sound
 */
function record(buffer) {
    check_permission();
    const mediaRecorder = new MediaRecorder(globalStream);
    play_recording_signal();
    setTimeout(() => {    
	start_recording(mediaRecorder);
    }, recording_signal_duration_ms + buffer * 1000);
    return () => {
	mediaRecorder.stop();
	play_recording_signal();
	return () => {
	    if (recorded_sound === undefined) {
		throw new Error("recording still being processed")
	    } else {
		return recorded_sound;
	    }
	};
    };
}

/**
 * Records a sound of given <CODE>duration</CODE> in seconds, after
 * a <CODE>buffer</CODE> also in seconds, and
 * returns a sound promise: a nullary function
 * that returns a sound. Example: <PRE><CODE>init_record();
 * const promise = record_for(2, 0.5);
 * // In next query, you can play the promised sound, by
 * // applying the promise:
 * play(promise());</CODE></PRE>
 * @param {number} duration - duration in seconds
 * @param {number} buffer - pause before recording, in seconds
 * @returns {function} <CODE>promise</CODE>: nullary function which returns the recorded sound
 */
function record_for(duration, buffer) {
    recorded_sound = undefined;
    const duration_ms = duration * 1000;
    check_permission();
    const mediaRecorder = new MediaRecorder(globalStream);
    play_recording_signal();
    setTimeout(() => {
	start_recording(mediaRecorder);
        setTimeout(() => {
	    mediaRecorder.stop();
	    play_recording_signal();
        }, duration_ms);
    }, recording_signal_duration_ms + buffer * 1000);
    return () => {
	    if (recorded_sound === undefined) {
		throw new Error("recording still being processed")
	    } else {
		return recorded_sound;
	    }
    };
}

function process(data) {
    const audioContext = new AudioContext();
    const blob = new Blob(data);
    
    convertToArrayBuffer(blob)
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(save);
}

// Converts input microphone sound (blob) into array format.
function convertToArrayBuffer(blob) {
    const url = URL.createObjectURL(blob);
    
    return fetch(url).then(response => {
        return response.arrayBuffer();
    });
}

function save(audioBuffer) {
    const array = audioBuffer.getChannelData(0);
    const duration = array.length / FS;
    recorded_sound = 
        make_sound( t => {
            const index = t * FS
            const lowerIndex = Math.floor(index)
            const upperIndex = lowerIndex + 1
            const ratio = index - lowerIndex
            const upper = array[upperIndex] ? array[upperIndex] : 0
            const lower = array[lowerIndex] ? array[lowerIndex] : 0
            return lower * (1 - ratio) + upper * ratio
        }, duration);
}

/* soundToneMatrix.js */
/*
  Support for CS1101S Mission 15
  Sound mission - Tone Matrix

  Author:
  v1 (2014/2015) Su Xuan - September 2014

  Modifier:
  v2 (2016/2017) Xiao Pu - September 2016 - fit source academy IDE
*/

var $tone_matrix; // canvas container for tone matrix

var color_white = "#ffffff"; // color of the highlighted square
var color_white_2 = "#666666"; // color of the adjacent squares
var color_white_3 = "#444444"; // color of the squares that are two units from the highlighted square
var color_on = "#cccccc";
var color_off = "#333333";

// the side length of the squares in the matrix
var square_side_length = 18;

// the distance between two adjacent squares in the matrix
var distance_between_squares = 6;

// margin of the canvas
var margin_length = 20;

// the duration for playing one grid is 0.5s
var grid_duration = 0.5;
// but the duration for playing one entire sound is 1 (which means there will be reverberations)
var sound_duration = 1;

// for playing the tone matrix repeatedly in play_matrix_continuously function
var timeout_matrix;
// for coloring the matrix accordingly while it's being played
var timeout_color;

var timeout_objects = new Array();

// given the x, y coordinates of a "click" event
// return the row and column numbers of the clicked square
function x_y_to_row_column(x, y) {
  var row = Math.floor((y - margin_length) / (square_side_length + distance_between_squares));
  var column = Math.floor((x - margin_length) / (square_side_length + distance_between_squares));
  return Array(row, column);
}

// given the row number of a square, return the leftmost coordinate
function row_to_y(row) {
  return margin_length + row * (square_side_length + distance_between_squares);
}

// given the column number of a square, return the topmost coordinate
function column_to_x(column) {
  return margin_length + column * (square_side_length + distance_between_squares);
}

// return a list representing a particular row
function get_row(row) {
  return vector_to_list(matrix[row]);
}

// return a list representing a particular column
function get_column(column) {
  var result = new Array(16);
  for (var i = 15; i >= 0; i--) {
    result[i] = matrix[i][column];
  };
  return vector_to_list(result);
}

function is_on(row, column) {
  if (row < 0 || row > 15 || column < 0 || column > 15) {
    return;
  }

  return matrix[row][column];
}

// set the color of a particular square
function set_color(row, column, color) {
  if (row < 0 || row > 15 || column < 0 || column > 15) {
    return;
  }

  var ctx = $tone_matrix.getContext("2d");
  ctx.fillStyle = color;

  ctx.fillRect(column_to_x(column),
    row_to_y(row),
    square_side_length,
    square_side_length);
}

// highlight a given square
function highlight_color(row, column, color) {
  set_color(row, column, color);
}

// given the square that we are supposed to highlight, color the neighboring squares
function set_adjacent_color_1(row, column, color) {
  if (!is_on(row, column - 1)) {
    set_color(row, column - 1, color);
  }

  if (!is_on(row, column + 1)) {
    set_color(row, column + 1, color);
  }

  if (!is_on(row - 1, column)) {
    set_color(row - 1, column, color);
  }

  if (!is_on(row + 1, column)) {
    set_color(row + 1, column, color);
  }
}

// given the square that we are supposed to highlight, color the squares 2 units from it
function set_adjacent_color_2(row, column, color) {
  if (!is_on(row, column - 2)) {
    set_color(row, column - 2, color);
  }

  if (!is_on(row + 1, column - 1)) {
    set_color(row + 1, column - 1, color);
  }

  if (!is_on(row + 2, column)) {
    set_color(row + 2, column, color);
  }

  if (!is_on(row + 1, column + 1)) {
    set_color(row + 1, column + 1, color);
  }

  if (!is_on(row, column + 2)) {
    set_color(row, column + 2, color);
  }

  if (!is_on(row - 1, column + 1)) {
    set_color(row - 1, column + 1, color);
  }

  if (!is_on(row - 2, column)) {
    set_color(row - 2, column, color);
  }

  if (!is_on(row - 1, column - 1)) {
    set_color(row - 1, column - 1, color);
  }
}

// redraw a matrix according to the current state of the matrix
function redraw_matrix() {
  for (var i = 15; i >= 0; i--) {
    for (var j = 15; j >= 0; j--) {
      if (matrix[i][j]) {
        set_color(i, j, color_on);
      } else {
        set_color(i, j, color_off);
      }
    };
  };
}

var ToneMatrix = {};

function initialise_matrix($container) {
  if (!$tone_matrix) {
    $tone_matrix = document.createElement('canvas');
    $tone_matrix.width = 420;
    $tone_matrix.height = 420;
    // the array representing the configuration of the matrix
    matrix = new Array(16);

    // the visualisation of the matrix itself
    var ctx = $tone_matrix.getContext("2d");

    // draw the initial matrix
    for (var i = 15; i >= 0; i--) {
      matrix[i] = new Array(16);
      for (var j = 15; j >= 0; j--) {
        set_color(i, j, color_off);
        matrix[i][j] = false;
      };
    };

    bind_events_to_rect($tone_matrix);
  }
  $tone_matrix.hidden = false
  $container.appendChild($tone_matrix)
}
ToneMatrix.initialise_matrix = initialise_matrix;

// bind the click events to the matrix
function bind_events_to_rect(c) {
  c.addEventListener('click', function (event) {
    // calculate the x, y coordinates of the click event
    var offset_left = $(this).offset().left;
    var offset_top = $(this).offset().top;
    var x = event.pageX - offset_left;
    var y = event.pageY - offset_top;

    // obtain the row and column numbers of the square clicked
    var row_column = x_y_to_row_column(x, y);
    var row = row_column[0];
    var column = row_column[1];

    if (row < 0 || row > 15 || column < 0 || column > 15) {
      return;
    }

    if (matrix[row][column] == undefined || !matrix[row][column]) {
      matrix[row][column] = true;
      set_color(row, column, color_on);
    } else {
      matrix[row][column] = false;
      set_color(row, column, color_off);
    }
  }, false);
}

function random_animate() {
  for (var i = 5; i >= 0; i--) {
    var row = Math.floor(Math.random() * 16);
    var column = Math.floor(Math.random() * 16);
    if (!is_on(row, column)) {
      set_color(row, column, color_white_3);
    }
  };

  for (var i = 10; i >= 0; i--) {
    var row = Math.floor(Math.random() * 16);
    var column = Math.floor(Math.random() * 16);
    if (!is_on(row, column)) {
      set_color(row, column, color_off);
    }
  };
}

function animate_column(n) {
  if (n < 0 || n > 15) {
    return;
  }

  var column = list_to_vector(get_column(n));

  for (var j = 0; j <= 15; j++) {
    if (column[j]) {
      // if a particular square is clicked, highlight itself
      // and the neighboring squares in the animation
      highlight_color(j, n, color_white);
      set_adjacent_color_1(j, n, color_white_2);
      set_adjacent_color_2(j, n, color_white_3);
    }
  };
}

function unanimate_column(n) {
  if (n < 0 || n > 15) {
    return;
  }

  var column = list_to_vector(get_column(n));

  for (var j = 0; j <= 15; j++) {
    if (column[j]) {
      highlight_color(j, n, color_on);
      set_adjacent_color_1(j, n, color_off);
      set_adjacent_color_2(j, n, color_off);
    }
  };
}

// generate a randomised matrix
function randomise_matrix() {
  var ctx = $tone_matrix.getContext("2d");
  var on; // the square in the matrix is on or off

  clear_matrix();
  // draw the randomised matrix
  for (var i = 15; i >= 0; i--) {
    for (var j = 15; j >= 0; j--) {
      on = Math.random() > 0.9;
      if (on) {
        set_color(i, j, color_on);
        matrix[i][j] = true;
      } else {
        set_color(i, j, color_off);
        matrix[i][j] = false;
      }
    };
  };
}
ToneMatrix.randomise_matrix = randomise_matrix;

function bindMatrixButtons() {
  $("#clear-matrix").on("click", function () {
    clear_matrix();
    // stop_matrix();
    $("#play-matrix").attr("value", "Play");
  });

  // $("#play-matrix").on("click", function () {
  //     if ($(this).attr("value") == "Play") {
  //         $(this).attr("value", "Stop");
  //         play_matrix_continuously();
  //     } else {
  //         $(this).attr("value", "Play");
  //         // stop_matrix();
  //         redraw_matrix();
  //     }
  // });

  // $("#random-matrix").on("click", function () {
  //     randomise_matrix();
  // });
};
ToneMatrix.bindMatrixButtons = bindMatrixButtons;

// ********** THE FOLLOWING FUNCTIONS ARE EXPOSED TO STUDENTS **********
// return the current state of the matrix, represented by a list of lists of bits
function get_matrix() {
  if (!matrix) {
    throw new Error("Please activate the tone matrix first by clicking on the tab!")
  }
  var matrix_list = matrix.slice(0);
  var result = [];
  for (var i = 0; i <= 15; i++) {
    result[i] = vector_to_list(matrix_list[15 - i]);
  };

  return vector_to_list(result);
}

// reset the matrix to the initial state
function clear_matrix() {
  matrix = new Array(16);
  var ctx = $tone_matrix.getContext("2d");

  // draw the initial matrix
  for (var i = 15; i >= 0; i--) {
    matrix[i] = new Array(16);
    for (var j = 15; j >= 0; j--) {
      set_color(i, j, color_off);
      matrix[i][j] = false;
    };
  };
}

ToneMatrix.clear_matrix = clear_matrix;

var set_time_out_renamed = window.setTimeout;

function set_timeout(f, t) {
  var timeoutObj = set_time_out_renamed(f, t);
  timeout_objects.push(timeoutObj);
}

function clear_all_timeout() {
  for (var i = timeout_objects.length - 1; i >= 0; i--) {
    clearTimeout(timeout_objects[i]);
  };

  timeout_objects = new Array();
}

// functions from mission 14
function letter_name_to_midi_note(note) {
  // we don't consider double flat/ double sharp
  var note = note.split("");
  var res = 12; //MIDI notes for mysterious C0
  var n = note[0].toUpperCase();
  switch (n) {
    case 'D':
      res = res + 2;
      break;

    case 'E':
      res = res + 4;
      break;

    case 'F':
      res = res + 5;
      break;

    case 'G':
      res = res + 7;
      break;

    case 'A':
      res = res + 9;
      break;

    case 'B':
      res = res + 11;
      break;

    default:
      break;
  }

  if (note.length === 2) {
    res = parseInt(note[1]) * 12 + res;
  } else if (note.length === 3) {
    switch (note[1]) {
      case '#':
        res = res + 1;
        break;

      case 'b':
        res = res - 1;
        break;

      default:
        break;
    }
    res = parseInt(note[2]) * 12 + res;
  }

  return res;
}

function letter_name_to_frequency(note) {
  return midi_note_to_frequency(note_to_midi_note(note));
}

function midi_note_to_frequency(note) {
  return 8.1757989156 * Math.pow(2, (note / 12));
}

function square_sound(freq, duration) {
    function fourier_expansion_square(t) {
        var answer = 0;
        for (var i = 1; i <= fourier_expansion_level; i++) {
            answer = answer +
		Math.sin(2 * Math.PI * (2 * i - 1) * freq * t)
		/
		(2 * i - 1);
        }
        return answer;
    }
    return make_sound(t => 
        (4 / Math.PI) * fourier_expansion_square(t),
        duration);
}

function triangle_sound(freq, duration) {
    function fourier_expansion_triangle(t) {
        var answer = 0;
        for (var i = 0; i < fourier_expansion_level; i++) {
            answer = answer +
		Math.pow(-1, i) *
		Math.sin((2 * i + 1) * t * freq * Math.PI * 2)
		/
		Math.pow((2 * i + 1), 2);
        }
        return answer;
    }
    return make_sound(t => 
        (8 / Math.PI / Math.PI) * fourier_expansion_triangle(t),
        duration);
}

function sawtooth_sound(freq, duration) {
    function fourier_expansion_sawtooth(t) {
        var answer = 0;
        for (var i = 1; i <= fourier_expansion_level; i++) {
            answer = answer + Math.sin(2 * Math.PI * i * freq * t) / i;
        }
        return answer;
    }
    return make_sound(t =>
		      (1 / 2) - (1 / Math.PI) * fourier_expansion_sawtooth(t),
		      duration);
}

function exponential_decay(decay_period) {
  return function (t) {
    if ((t > decay_period) || (t < 0)) {
      return undefined;
    } else {
      var halflife = decay_period / 8;
      var lambda = Math.log(2) / halflife;
      return Math.pow(Math.E, -lambda * t);
    }
  }
}

/**
 * Returns an envelope: a function from sound to sound.
 * When the envelope is applied to a sound, it returns
 * a new sound that results from applying ADSR to
 * the given sound. The Attack duration, Sustain duration and
 * Release duration are given in the first, second and fourth
 * arguments in seconds, and the Sustain level is given in 
 * the third argument as a fraction between 0 and 1.
 * @param {number} attack_time - duration of attack phase in seconds
 * @param {number} decay_time - duration of decay phase in seconds
 * @param {number} sustain_level - sustain level between 0 and 1
 * @param {number} release_time - duration of release phase in seconds
 * @returns {function} envelope: function from sound to sound
 */
function adsr(attack_time, decay_time, sustain_level, release_time) {
  return sound => {
    var wave = get_wave(sound);
    var duration = get_duration(sound);
    return make_sound( x => {
      if (x < attack_time) {
        return wave(x) * (x / attack_time);
      } else if (x < attack_time + decay_time) {
        return ((1 - sustain_level) * (exponential_decay(decay_time))(x - attack_time) + sustain_level) * wave(x);
      } else if (x < duration - release_time) {
        return wave(x) * sustain_level;
      } else if (x <= duration) {
        return wave(x) * sustain_level * (exponential_decay(release_time))(x - (duration - release_time));
      } else {
        return 0;
      }
    }, duration);
  };
}

// waveform is a function that accepts freq, dur and returns sound
/**
 * Returns a sound that results from applying a list of envelopes
 * to a given wave form. The wave form should be a sound generator that
 * takes a frequency and a duration as arguments and produces a
 * sound with the given frequency and duration. Each evelope is
 * applied to a harmonic: the first harmonic has the given frequency,
 * the second has twice the frequency, the third three times the
 * frequency etc.
 * @param {function} waveform - function from frequency and duration to sound
 * @param {number} base_frequency - frequency of the first harmonic
 * @param {number} duration - duration of the produced sound, in seconds
 * @param {list_of_envelope} envelopes - each a function from sound to sound
 * @returns {sound} resulting sound
 */
function stacking_adsr(waveform, base_frequency, duration, envelopes) {
  function zip(lst, n) {
    if (is_null(lst)) {
      return lst;
    } else {
      return pair(pair(n, head(lst)), zip(tail(lst), n + 1));
    }
  }

  return simultaneously(accumulate(
      (x, y) => pair((tail(x))
		     (waveform(base_frequency * head(x), duration))
		     , y)
      , null
      , zip(envelopes, 1)));
}

// instruments for students

/**
 * returns a sound that is reminiscent of a trombone, playing
 * a given note for a given <CODE>duration</CODE> of seconds
 * @param {number} note - midi note
 * @param {number} duration - duration in seconds
 * @returns {function} <CODE>stop</CODE> to stop recording, 
 */
function trombone(note, duration) {
  return stacking_adsr(square_sound, midi_note_to_frequency(note), duration,
    list(adsr(0.4, 0, 1, 0),
      adsr(0.6472, 1.2, 0, 0)));
}

/**
 * returns a sound that is reminiscent of a piano, playing
 * a given note for a given <CODE>duration</CODE> of seconds
 * @param {number} note - midi note
 * @param {number} duration - duration in seconds
 * @returns {function} <CODE>stop</CODE> to stop recording, 
 */
function piano(note, duration) {
  return stacking_adsr(triangle_sound, midi_note_to_frequency(note), duration,
    list(adsr(0, 1.03, 0, 0),
      adsr(0, 0.64, 0, 0),
      adsr(0, 0.4, 0, 0)));
}

/**
 * returns a sound that is reminiscent of a bell, playing
 * a given note for a given <CODE>duration</CODE> of seconds
 * @param {number} note - midi note
 * @param {number} duration - duration in seconds
 * @returns {function} <CODE>stop</CODE> to stop recording, 
 */
function bell(note, duration) {
  return stacking_adsr(square_sound, midi_note_to_frequency(note), duration,
    list(adsr(0, 1.2, 0, 0),
      adsr(0, 1.3236, 0, 0),
      adsr(0, 1.5236, 0, 0),
      adsr(0, 1.8142, 0, 0)));
}

/**
 * returns a sound that is reminiscent of a violin, playing
 * a given note for a given <CODE>duration</CODE> of seconds
 * @param {number} note - midi note
 * @param {number} duration - duration in seconds
 * @returns {function} <CODE>stop</CODE> to stop recording, 
 */
function violin(note, duration) {
  return stacking_adsr(sawtooth_sound, midi_note_to_frequency(note), duration,
    list(adsr(0.7, 0, 1, 0.3),
      adsr(0.7, 0, 1, 0.3),
      adsr(0.9, 0, 1, 0.3),
      adsr(0.9, 0, 1, 0.3)));
}

/**
 * returns a sound that is reminiscent of a cello, playing
 * a given note for a given <CODE>duration</CODE> of seconds
 * @param {number} note - midi note
 * @param {number} duration - duration in seconds
 * @returns {function} <CODE>stop</CODE> to stop recording, 
 */
function cello(note, duration) {
  return stacking_adsr(square_sound, midi_note_to_frequency(note), duration,
    list(adsr(0.1, 0, 1, 0.2),
      adsr(0.1, 0, 1, 0.3),
      adsr(0, 0, 0.2, 0.3)));
}

function string_to_list_of_numbers(string) {
  var array_of_numbers = string.split("");
  return map(function (x) {
    return parseInt(x);
  }, vector_to_list(array_of_numbers));
}

/* fft.js */
function FFT(size) {
  this.size = size | 0;
  if (this.size <= 1 || (this.size & (this.size - 1)) !== 0)
    throw new Error('FFT size must be a power of two and bigger than 1');

  this._csize = size << 1;

  // NOTE: Use of `var` is intentional for old V8 versions
  var table = new Array(this.size * 2);
  for (var i = 0; i < table.length; i += 2) {
    const angle = Math.PI * i / this.size;
    table[i] = Math.cos(angle);
    table[i + 1] = -Math.sin(angle);
  }
  this.table = table;

  // Find size's power of two
  var power = 0;
  for (var t = 1; this.size > t; t <<= 1)
    power++;

  // Calculate initial step's width:
  //   * If we are full radix-4 - it is 2x smaller to give inital len=8
  //   * Otherwise it is the same as `power` to give len=4
  this._width = power % 2 === 0 ? power - 1 : power;

  // Pre-compute bit-reversal patterns
  this._bitrev = new Array(1 << this._width);
  for (var j = 0; j < this._bitrev.length; j++) {
    this._bitrev[j] = 0;
    for (var shift = 0; shift < this._width; shift += 2) {
      var revShift = this._width - shift - 2;
      this._bitrev[j] |= ((j >>> shift) & 3) << revShift;
    }
  }

  this._out = null;
  this._data = null;
  this._inv = 0;
}

FFT.prototype.fromComplexArray = function fromComplexArray(complex, storage) {
  var res = storage || new Array(complex.length >>> 1);
  for (var i = 0; i < complex.length; i += 2)
    res[i >>> 1] = complex[i];
  return res;
};

FFT.prototype.createComplexArray = function createComplexArray() {
  const res = new Array(this._csize);
  for (var i = 0; i < res.length; i++)
    res[i] = 0;
  return res;
};

FFT.prototype.toComplexArray = function toComplexArray(input, storage) {
  var res = storage || this.createComplexArray();
  for (var i = 0; i < res.length; i += 2) {
    res[i] = input[i >>> 1];
    res[i + 1] = 0;
  }
  return res;
};

FFT.prototype.completeSpectrum = function completeSpectrum(spectrum) {
  var size = this._csize;
  var half = size >>> 1;
  for (var i = 2; i < half; i += 2) {
    spectrum[size - i] = spectrum[i];
    spectrum[size - i + 1] = -spectrum[i + 1];
  }
};

FFT.prototype.transform = function transform(out, data) {
  if (out === data)
    throw new Error('Input and output buffers must be different');

  this._out = out;
  this._data = data;
  this._inv = 0;
  this._transform4();
  this._out = null;
  this._data = null;
};

FFT.prototype.realTransform = function realTransform(out, data) {
  if (out === data)
    throw new Error('Input and output buffers must be different');

  this._out = out;
  this._data = data;
  this._inv = 0;
  this._realTransform4();
  this._out = null;
  this._data = null;
};

FFT.prototype.inverseTransform = function inverseTransform(out, data) {
  if (out === data)
    throw new Error('Input and output buffers must be different');

  this._out = out;
  this._data = data;
  this._inv = 1;
  this._transform4();
  for (var i = 0; i < out.length; i++)
    out[i] /= this.size;
  this._out = null;
  this._data = null;
};

// radix-4 implementation
//
// NOTE: Uses of `var` are intentional for older V8 version that do not
// support both `let compound assignments` and `const phi`
FFT.prototype._transform4 = function _transform4() {
  var out = this._out;
  var size = this._csize;

  // Initial step (permute and transform)
  var width = this._width;
  var step = 1 << width;
  var len = (size / step) << 1;

  var outOff;
  var t;
  var bitrev = this._bitrev;
  if (len === 4) {
    for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
      const off = bitrev[t];
      this._singleTransform2(outOff, off, step);
    }
  } else {
    // len === 8
    for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
      const off = bitrev[t];
      this._singleTransform4(outOff, off, step);
    }
  }

  // Loop through steps in decreasing order
  var inv = this._inv ? -1 : 1;
  var table = this.table;
  for (step >>= 2; step >= 2; step >>= 2) {
    len = (size / step) << 1;
    var quarterLen = len >>> 2;

    // Loop through offsets in the data
    for (outOff = 0; outOff < size; outOff += len) {
      // Full case
      var limit = outOff + quarterLen;
      for (var i = outOff, k = 0; i < limit; i += 2, k += step) {
        const A = i;
        const B = A + quarterLen;
        const C = B + quarterLen;
        const D = C + quarterLen;

        // Original values
        const Ar = out[A];
        const Ai = out[A + 1];
        const Br = out[B];
        const Bi = out[B + 1];
        const Cr = out[C];
        const Ci = out[C + 1];
        const Dr = out[D];
        const Di = out[D + 1];

        // Middle values
        const MAr = Ar;
        const MAi = Ai;

        const tableBr = table[k];
        const tableBi = inv * table[k + 1];
        const MBr = Br * tableBr - Bi * tableBi;
        const MBi = Br * tableBi + Bi * tableBr;

        const tableCr = table[2 * k];
        const tableCi = inv * table[2 * k + 1];
        const MCr = Cr * tableCr - Ci * tableCi;
        const MCi = Cr * tableCi + Ci * tableCr;

        const tableDr = table[3 * k];
        const tableDi = inv * table[3 * k + 1];
        const MDr = Dr * tableDr - Di * tableDi;
        const MDi = Dr * tableDi + Di * tableDr;

        // Pre-Final values
        const T0r = MAr + MCr;
        const T0i = MAi + MCi;
        const T1r = MAr - MCr;
        const T1i = MAi - MCi;
        const T2r = MBr + MDr;
        const T2i = MBi + MDi;
        const T3r = inv * (MBr - MDr);
        const T3i = inv * (MBi - MDi);

        // Final values
        const FAr = T0r + T2r;
        const FAi = T0i + T2i;

        const FCr = T0r - T2r;
        const FCi = T0i - T2i;

        const FBr = T1r + T3i;
        const FBi = T1i - T3r;

        const FDr = T1r - T3i;
        const FDi = T1i + T3r;

        out[A] = FAr;
        out[A + 1] = FAi;
        out[B] = FBr;
        out[B + 1] = FBi;
        out[C] = FCr;
        out[C + 1] = FCi;
        out[D] = FDr;
        out[D + 1] = FDi;
      }
    }
  }
};

// radix-2 implementation
//
// NOTE: Only called for len=4
FFT.prototype._singleTransform2 = function _singleTransform2(outOff, off,
                                                             step) {
  const out = this._out;
  const data = this._data;

  const evenR = data[off];
  const evenI = data[off + 1];
  const oddR = data[off + step];
  const oddI = data[off + step + 1];

  const leftR = evenR + oddR;
  const leftI = evenI + oddI;
  const rightR = evenR - oddR;
  const rightI = evenI - oddI;

  out[outOff] = leftR;
  out[outOff + 1] = leftI;
  out[outOff + 2] = rightR;
  out[outOff + 3] = rightI;
};

// radix-4
//
// NOTE: Only called for len=8
FFT.prototype._singleTransform4 = function _singleTransform4(outOff, off,
                                                             step) {
  const out = this._out;
  const data = this._data;
  const inv = this._inv ? -1 : 1;
  const step2 = step * 2;
  const step3 = step * 3;

  // Original values
  const Ar = data[off];
  const Ai = data[off + 1];
  const Br = data[off + step];
  const Bi = data[off + step + 1];
  const Cr = data[off + step2];
  const Ci = data[off + step2 + 1];
  const Dr = data[off + step3];
  const Di = data[off + step3 + 1];

  // Pre-Final values
  const T0r = Ar + Cr;
  const T0i = Ai + Ci;
  const T1r = Ar - Cr;
  const T1i = Ai - Ci;
  const T2r = Br + Dr;
  const T2i = Bi + Di;
  const T3r = inv * (Br - Dr);
  const T3i = inv * (Bi - Di);

  // Final values
  const FAr = T0r + T2r;
  const FAi = T0i + T2i;

  const FBr = T1r + T3i;
  const FBi = T1i - T3r;

  const FCr = T0r - T2r;
  const FCi = T0i - T2i;

  const FDr = T1r - T3i;
  const FDi = T1i + T3r;

  out[outOff] = FAr;
  out[outOff + 1] = FAi;
  out[outOff + 2] = FBr;
  out[outOff + 3] = FBi;
  out[outOff + 4] = FCr;
  out[outOff + 5] = FCi;
  out[outOff + 6] = FDr;
  out[outOff + 7] = FDi;
};

// Real input radix-4 implementation
FFT.prototype._realTransform4 = function _realTransform4() {
  var out = this._out;
  var size = this._csize;

  // Initial step (permute and transform)
  var width = this._width;
  var step = 1 << width;
  var len = (size / step) << 1;

  var outOff;
  var t;
  var bitrev = this._bitrev;
  if (len === 4) {
    for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
      const off = bitrev[t];
      this._singleRealTransform2(outOff, off >>> 1, step >>> 1);
    }
  } else {
    // len === 8
    for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
      const off = bitrev[t];
      this._singleRealTransform4(outOff, off >>> 1, step >>> 1);
    }
  }

  // Loop through steps in decreasing order
  var inv = this._inv ? -1 : 1;
  var table = this.table;
  for (step >>= 2; step >= 2; step >>= 2) {
    len = (size / step) << 1;
    var halfLen = len >>> 1;
    var quarterLen = halfLen >>> 1;
    var hquarterLen = quarterLen >>> 1;

    // Loop through offsets in the data
    for (outOff = 0; outOff < size; outOff += len) {
      for (var i = 0, k = 0; i <= hquarterLen; i += 2, k += step) {
        var A = outOff + i;
        var B = A + quarterLen;
        var C = B + quarterLen;
        var D = C + quarterLen;

        // Original values
        var Ar = out[A];
        var Ai = out[A + 1];
        var Br = out[B];
        var Bi = out[B + 1];
        var Cr = out[C];
        var Ci = out[C + 1];
        var Dr = out[D];
        var Di = out[D + 1];

        // Middle values
        var MAr = Ar;
        var MAi = Ai;

        var tableBr = table[k];
        var tableBi = inv * table[k + 1];
        var MBr = Br * tableBr - Bi * tableBi;
        var MBi = Br * tableBi + Bi * tableBr;

        var tableCr = table[2 * k];
        var tableCi = inv * table[2 * k + 1];
        var MCr = Cr * tableCr - Ci * tableCi;
        var MCi = Cr * tableCi + Ci * tableCr;

        var tableDr = table[3 * k];
        var tableDi = inv * table[3 * k + 1];
        var MDr = Dr * tableDr - Di * tableDi;
        var MDi = Dr * tableDi + Di * tableDr;

        // Pre-Final values
        var T0r = MAr + MCr;
        var T0i = MAi + MCi;
        var T1r = MAr - MCr;
        var T1i = MAi - MCi;
        var T2r = MBr + MDr;
        var T2i = MBi + MDi;
        var T3r = inv * (MBr - MDr);
        var T3i = inv * (MBi - MDi);

        // Final values
        var FAr = T0r + T2r;
        var FAi = T0i + T2i;

        var FBr = T1r + T3i;
        var FBi = T1i - T3r;

        out[A] = FAr;
        out[A + 1] = FAi;
        out[B] = FBr;
        out[B + 1] = FBi;

        // Output final middle point
        if (i === 0) {
          var FCr = T0r - T2r;
          var FCi = T0i - T2i;
          out[C] = FCr;
          out[C + 1] = FCi;
          continue;
        }

        // Do not overwrite ourselves
        if (i === hquarterLen)
          continue;

        // In the flipped case:
        // MAi = -MAi
        // MBr=-MBi, MBi=-MBr
        // MCr=-MCr
        // MDr=MDi, MDi=MDr
        var ST0r = T1r;
        var ST0i = -T1i;
        var ST1r = T0r;
        var ST1i = -T0i;
        var ST2r = -inv * T3i;
        var ST2i = -inv * T3r;
        var ST3r = -inv * T2i;
        var ST3i = -inv * T2r;

        var SFAr = ST0r + ST2r;
        var SFAi = ST0i + ST2i;

        var SFBr = ST1r + ST3i;
        var SFBi = ST1i - ST3r;

        var SA = outOff + quarterLen - i;
        var SB = outOff + halfLen - i;

        out[SA] = SFAr;
        out[SA + 1] = SFAi;
        out[SB] = SFBr;
        out[SB + 1] = SFBi;
      }
    }
  }
};

// radix-2 implementation
//
// NOTE: Only called for len=4
FFT.prototype._singleRealTransform2 = function _singleRealTransform2(outOff,
                                                                     off,
                                                                     step) {
  const out = this._out;
  const data = this._data;

  const evenR = data[off];
  const oddR = data[off + step];

  const leftR = evenR + oddR;
  const rightR = evenR - oddR;

  out[outOff] = leftR;
  out[outOff + 1] = 0;
  out[outOff + 2] = rightR;
  out[outOff + 3] = 0;
};

// radix-4
//
// NOTE: Only called for len=8
FFT.prototype._singleRealTransform4 = function _singleRealTransform4(outOff,
                                                                     off,
                                                                     step) {
  const out = this._out;
  const data = this._data;
  const inv = this._inv ? -1 : 1;
  const step2 = step * 2;
  const step3 = step * 3;

  // Original values
  const Ar = data[off];
  const Br = data[off + step];
  const Cr = data[off + step2];
  const Dr = data[off + step3];

  // Pre-Final values
  const T0r = Ar + Cr;
  const T1r = Ar - Cr;
  const T2r = Br + Dr;
  const T3r = inv * (Br - Dr);

  // Final values
  const FAr = T0r + T2r;

  const FBr = T1r;
  const FBi = -T3r;

  const FCr = T0r - T2r;

  const FDr = T1r;
  const FDi = T3r;

  out[outOff] = FAr;
  out[outOff + 1] = 0;
  out[outOff + 2] = FBr;
  out[outOff + 3] = FBi;
  out[outOff + 4] = FCr;
  out[outOff + 5] = 0;
  out[outOff + 6] = FDr;
  out[outOff + 7] = FDi;
};
