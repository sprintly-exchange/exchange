class Queue {
    entries;
    constructor(initialData:any) {
      this.entries = initialData || [];
    }
  
    // Method to add an entry to the queue
    enqueue(entry:any) {
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