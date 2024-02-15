import React, { useEffect, useState } from 'react';
import './App.css';

const n = 20;
const array = [];
let isSorting = false; // Flag variable to track whether sorting is in progress

const App = () => {
  const [audioCtx, setAudioCtx] = useState(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bubbleSort');
  const [sortingTime, setSortingTime] = useState(0);
  // Default sorting algorithm

  useEffect(() => {
    init();
    // Initialize AudioContext when the component mounts
    const newAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    setAudioCtx(newAudioCtx);
  }, []);

  const playNote = (freq) => {
    return new Promise((resolve, reject) => {
      const frequency = Math.max(20, Math.min(20000, freq));
      const dur = 0.1;
      const osc = audioCtx.createOscillator();
      osc.frequency.value = frequency;
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
      const node = audioCtx.createGain();
      node.gain.value = 0.1;
      node.gain.linearRampToValueAtTime(0, audioCtx.currentTime + dur);
      osc.connect(node);
      node.connect(audioCtx.destination);
      resolve();
    });
  };

  const init = () => {
    for (let i = 0; i < n; i++) {
      array[i] = Math.random();
    }
    showBars();
  };

  const play = () => {
    const startTime = performance.now(); // Start time when sorting begins
  
    if (isSorting) return;
    const copy = [...array];
    let moves;
    switch (selectedAlgorithm) {
      case 'bubbleSort':
        moves = bubbleSort(copy);
        break;
      case 'mergeSort':
        moves = mergeSort(copy);
        break;
      case 'quickSort':
        moves = quickSort(copy);
        break;
      default:
        console.error('Invalid algorithm selected');
        return;
    }
    animate(moves, startTime); // Pass startTime to the animate function
  };
  
  
  const animate = async (moves, startTime) => { // Accept startTime as an argument
    isSorting = true; // Set flag to indicate sorting is in progress
    for (const move of moves) {
      if (!isSorting) return; // Check flag to determine if sorting should continue
      const [i, j] = move.indices;
      if (move.type === 'swap') {
        [array[i], array[j]] = [array[j], array[i]];
      }
      await playNote(250 + array[i] * 500);
      await playNote(300 + array[j] * 500);
      showBars(move);
      await new Promise(resolve => setTimeout(resolve, 75));
    }
    showBars(); // Show final sorted bars
    isSorting = false; // Reset flag to indicate sorting is complete
    const endTime = performance.now(); // End time when sorting ends
    const totalTime = (endTime - startTime) / 1000; // Calculate total time taken in seconds
    setSortingTime(totalTime);
  };
  

  const bubbleSort = (arr) => {
    const moves = [];
    let swapped;
    do {
      swapped = false;
      for (let i = 1; i < arr.length; i++) {
        if (arr[i - 1] > arr[i]) {
          swapped = true;
          moves.push({ indices: [i - 1, i], type: 'swap' });
          [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
        }
      }
    } while (swapped);
    return moves;
  };



  const mergeSort = (arr) => {
    const moves = [];
  
    const merge = (left, right) => {
      let result = [];
      let leftIndex = 0;
      let rightIndex = 0;
  
      while (leftIndex < left.length && rightIndex < right.length) {
        if (left[leftIndex] >= right[rightIndex]) {
          result.push(left[leftIndex++]);
        } else {
          result.push(right[rightIndex++]);
        }
      }
  
      while (leftIndex < left.length) {
        result.push(left[leftIndex++]);
      }
  
      while (rightIndex < right.length) {
        result.push(right[rightIndex++]);
      }
  
      return result;
    };
  
    const sort = (arr) => {
      if (arr.length <= 1) {
        return arr;
      }
  
      const mid = Math.floor(arr.length / 2);
      const left = arr.slice(0, mid);
      const right = arr.slice(mid);
  
      return merge(sort(left), sort(right));
    };
  
    // Perform the sorting and record moves
    const sortedArray = sort(arr.slice());
    let isSorted = false;
  
    while (!isSorted) {
      isSorted = true;
  
      for (let i = 0; i < arr.length; i++) {
        const index = sortedArray.indexOf(arr[i]);
        if (index !== i) {
          isSorted = false;
          moves.push({ indices: [i, index], type: 'swap' });
          [arr[i], arr[index]] = [arr[index], arr[i]]; // Swap elements in the original array
        }
      }
    }
  
    return moves;
  };
  




  const quickSort = (arr) => {
    const moves = [];
  
    const partition = (arr, low, high) => {
      const pivot = arr[high];
      let i = low - 1;
  
      for (let j = low; j <= high - 1; j++) {
        if (arr[j] < pivot) {
          i++;
          moves.push({ indices: [i, j], type: 'swap' });
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
      }
      moves.push({ indices: [i + 1, high], type: 'swap' });
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      return i + 1;
    };
  
    const sort = (arr, low, high) => {
      if (low < high) {
        const pi = partition(arr, low, high);
        sort(arr, low, pi - 1);
        sort(arr, pi + 1, high);
      }
    };
  
    sort(arr, 0, arr.length - 1);
    return moves;
  };
  






  

  

  const showBars = (move) => {
    const container = document.getElementById('container');
    container.innerHTML = '';
    for (let i = 0; i < array.length; i++) {
      const bar = document.createElement('div');
      bar.style.height = array[i] * 100 + '%';
      bar.classList.add('bar');
      if (move && move.indices.includes(i)) {
        bar.style.backgroundColor = move.type === 'swap' ? '#00ccff' : 'blue';
      }
      container.appendChild(bar);
    }
  };

  const handleRandomize = () => {
    if (isSorting) return; // Prevent randomization while sorting is in progress
    init(); // Randomize the array
  };

  const handleAlgorithmChange = (event) => {
    setSelectedAlgorithm(event.target.value);
  };

  

  return (
    <div>
      <h1>Sorting Visualizer</h1>
      <div id="container"></div>
      <hr style={{ 
        border: 0,
        height: '1px',
        backgroundColor: "#32A9F4"
      }} />
  
      <div className="button-select-container">
        <div className="button-container">
          <button className="sort-btn" onClick={play}>
            Sort
          </button>
          <button className="randomize-btn" onClick={handleRandomize}>
            Randomize
          </button>
        </div>
        <div className="select-container">
          <select value={selectedAlgorithm} onChange={handleAlgorithmChange}>
            <option value="bubbleSort">Bubble Sort</option>
            <option value="mergeSort">Merge Sort</option>
            <option value="quickSort">Quick Sort</option>
          </select>
          <div>Sorting Time: {sortingTime.toFixed(4)} seconds</div>
        </div>
      </div>
    </div>
  );
    };  

export default App;