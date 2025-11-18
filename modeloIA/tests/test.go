package main

import "fmt"

func add(a int, b int) int {
	return a + b
}

func multiply(x, y int) int {
	return x * y
}

func greet(name string) {
	fmt.Printf("Hello, %s!\n", name)
}

type Person struct {
	Name string
	Age  int
}

func (p Person) Introduce() string {
	return fmt.Sprintf("Hi, I'm %s and I'm %d years old", p.Name, p.Age)
}

func main() {
	result := add(5, 3)
	fmt.Println(result)
}
