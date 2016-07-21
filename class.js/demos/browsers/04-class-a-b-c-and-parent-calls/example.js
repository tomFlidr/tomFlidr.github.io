Class.Define('A', {
	Static: {
		Create: function (one, two, three) {
			console.log(this.Name+'::Create('+one+','+two+','+three+')');
			return new this.self(one, two, three);
		},
		FirstStatic: function (a, b, c) {
			console.log(this.Name+'::FirstStatic('+a+','+b+','+c+')');
			this._privateMethodWithUnderscore();
		},
		_privateMethodWithUnderscore: function () {
			console.log(this.Name+'::_privateMethodWithUnderscore();');
		}
	},
	Constructor: function (one, two, three) {
		console.log(this.self.Name+'->Constructor('+one+','+two+','+three+')');
	},
	FirstDynamic: function (f, g, h) {
		console.log(this.self.Name+'->FirstDynamic('+f+','+g+','+h+')');
		return this;
	},
	SecondDynamic: function (x, y, z) {
		console.log(this.self.Name+'->SecondDynamic('+x+','+y+','+z+')');
		return this;
	},
	ThirdDynamic: function (x, y, z) {
		console.log(this.self.Name+'->ThirdDynamic('+x+','+y+','+z+')');
		return this;
	}
});

Class.Define('B', {
	Extend: A,
	Static: {
		Create: function (one, two, three) {
			console.log(this.Name+'::Create('+one+','+two+','+three+')');
			return new this.self(one, two, three);
		},
		SecondStatic: function (a, b, c) {
			console.log(this.Name+'::SecondStatic('+a+','+b+','+c+')');
			this.FirstStatic(a, b, c);
			try {
				this._privateMethodWithUnderscore();
			} catch (e) {
				console.log(e.message);
			}
		}
	},
	Constructor: function (one, two, three) {
		console.log(this.self.Name+'->Constructor('+one+','+two+','+three+')');
		this.parent.apply(this, [one, two, three]);
	},
	FirstDynamic: function (x, y, z) {
		console.log(this.self.Name+'->FirstDynamic('+x+','+y+','+z+')');
		this.ThirdDynamic(x, y, z);
		return this;
	},
	ThirdDynamic: function (x, y, z) {
		console.log(this.self.Name+'->ThirdDynamic('+x+','+y+','+z+')');
		this.parent.ThirdDynamic();
		return this;
	}
});

Class.Define('C', {
	Extend: B,
	Static: {
		Create: function (one, two, three) {
			console.log(this.Name+'::Create('+one+','+two+','+three+')');
			return Class.Create(this.self.Name, [].slice.apply(arguments));
		},
		FirstStatic: function (a, b, c) {
			console.log(this.Name+'::FirstStatic('+a+','+b+','+c+')');
		},
		SecondStatic: function (a, b, c) {
			console.log(this.Name+'::SecondStatic('+a+','+b+','+c+')');
		},
		ThirtStatic: function (a, b, c) {
			console.log(this.Name+'::ThirtStatic('+a+','+b+','+c+')');
			this.parent.SecondStatic(a, b, c);
		}
	},
	Constructor: function (one, two, three) {
		console.log(this.self.Name+'->Constructor('+one+','+two+','+three+')');
		this.parent(one, two, three);
	},
	FirstDynamic: function (f, g, h) {
		console.log(this.self.Name+'->FirstDynamic('+f+','+g+','+h+')');
		this.parent.SecondDynamic(f, g, h);
		return this;
	},
	SecondDynamic: function (m, n, o) {
		console.log(this.self.Name+'->SecondDynamic('+m+','+n+','+o+')');
		this.ThirdDynamic(m, n, o);
		return this;
	},
	ThirdDynamic: function (x, y, z) {
		console.log(this.self.Name+'->ThirdDynamic('+x+','+y+','+z+')');
		this.parent.FirstDynamic(x, y, z);
		return this;
	}
});


/**
This code flows through methods:
	C::ThirtStatic(a,b,c)
		B::SecondStatic(a,b,c)
			A::FirstStatic(a,b,c)
			A::_privateMethodWithUnderscore();
		Error: Private method call: 
		'_privateMethodWithUnderscore' 
		not allowed from class context: 'B'.
	C::Create(1,2,3)
*/
C.ThirtStatic('a', 'b', 'c');


/**
This code flows through methods:
	C->Constructor(1,2,3)
		B->Constructor(1,2,3)
			A->Constructor(1,2,3)
*/
var c = C.Create(1, 2, 3)
	/**
	This code flows through methods:
		C->FirstDynamic(f,g,h)
				A->SecondDynamic(f,g,h)
	*/
	.FirstDynamic('f', 'g', 'h')
	/**
	This code flows through methods:
		C->SecondDynamic(m,n,o)
		C->ThirdDynamic(m,n,o)
			B->FirstDynamic(m,n,o)
			B->ThirdDynamic(m,n,o)
				A->FirstDynamic(m,n,o)
	*/
	.SecondDynamic('m', 'n', 'o')
	/**
	This code flows through methods:
		C->ThirdDynamic(x,y,z)
			B->FirstDynamic(x,y,z)
				A->ThirdDynamic(x,y,z)
	*/
	.ThirdDynamic('x', 'y', 'z');

console.log(c); // [object C]