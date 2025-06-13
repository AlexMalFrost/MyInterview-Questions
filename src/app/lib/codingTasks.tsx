export const codingTasks = [
  {
    wrongCode: `
  function greet(name) {
    cosnole.log("Hello, " + nmae);
  }
  greet("John");
  `,
    correctCode: `
  function greet(name) {
    console.log("Hello, " + name);
  }
  greet("John");
  `,
  },
  {
    wrongCode: `
  const add = (a, b) => {
    return a + b;
  console.log(add(2, 3));
  `,
    correctCode: `
  const add = (a, b) => {
    return a + b;
  };
  console.log(add(2, 3));
  `,
  },
  {
    wrongCode: `
  if (true) {
    let x = 5;
  }
  console.log(x);
  `,
    correctCode: `
  if (true) {
    var x = 5;
  };
  console.log(x);
  `,
  },
];
