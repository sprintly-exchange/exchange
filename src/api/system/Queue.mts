class Queue {
    constructor(initialData) {
      this.entries = initialData || [];
    }
  
    // Method to add an entry to the queue
    enqueue(entry) {
      this.entries.push(entry);
    }
  
    // Method to remove an entry from the queue
    dequeue() {
      return this.entries.shift();
    }
  
    // Method to get the size of the queue
    size() {
      return this.entries.length;
    }
  }

  export default Queue;