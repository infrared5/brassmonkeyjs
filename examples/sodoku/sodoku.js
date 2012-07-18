/**
 * Sudoku generator + Sudoku grid classes
 * 
 * @author Jani Hartikainen <firstname at codeutopia net>
 */

if(!CU)
	var CU = { };

CU.Sudoku = {
	/**
	 * Generate a CU.sudoku.Grid
	 * @return CU.sudoku.Grid a new random sudoku puzzle
	 */
	generate: function() {
		var grid = new CU.sudoku.Grid();
	
		//We need to keep track of all numbers tried in every cell
		var cellNumbers = [];
		for(var i = 0; i < 81; i++)
		{
			cellNumbers[i] = [1,2,3,4,5,6,7,8,9];
		}

		for(var i = 0; i < 81; i++)
		{	
			var found = false;
			var row = Math.floor(i / 9);
			var col = i - (row * 9);
			
			while(cellNumbers[i].length > 0)
			{
				//Pick a random number to try
				var rnd = Math.floor(Math.random() * cellNumbers[i].length);
				var num = cellNumbers[i].splice(rnd, 1)[0];
				
				grid.setValue(col, row, num);
				
				if(!grid.cellConflicts(col, row)) 
				{
					found = true;						
					break;
				}
				else
				{
					grid.setValue(col, row, 0);
					found = false;
					continue;
				}
			}
			
			//If a possible number was not found, backtrack			
			if(!found)
			{
				//After backtracking we can try all numbers here again
				cellNumbers[i] = [1,2,3,4,5,6,7,8,9];
				
				//Reduce by two, since the loop increments by one
				i -= 2;
			}
		}
			
		return grid;
	},
	
	/**
	 * Clear N cells from the sudoku grid randomly
	 * @param {CU.sudoku.Grid} grid
	 * @param {Number} amount
	 */
	cull: function(grid, amount) {
		var cells = [];
		for(var i = 0; i < 81; i++)
			cells.push(i);
			
		for(var i = 0; i < amount; i++)
		{
			var rnd = Math.floor(Math.random() * cells.length);
			var value = cells.splice(rnd, 1);
			var row = Math.floor(value / 9);
			var col = value - (row * 9);
			
			grid.setValue(col, row, 0);	
		}
	}	
};

CU.sudoku = { };

/**
 * A class for representing sudoku puzzle grids
 * @constructor
 */
CU.sudoku.Grid = function() {
	this.rows = [];
	for(var row = 0; row < 9; row++)
	{
		var cols = [];
		for(var col = 0; col < 9; col++)
			cols[col] = 0;
			
		this.rows[row] = cols;
	}
};

CU.sudoku.Grid.prototype = {
	rows: [],
	
	/**
	 * Return value of a col,row in the grid
	 * @method
	 * @param {Number} col
	 * @param {Number} row
	 * @return {Number} 0 to 9, 0 meaning empty
	 */
	getValue: function(col, row) {
		return this.rows[row][col];
	},
	
	/**
	 * Set value of col,row in the grid.
	 * @method
	 * @param {Number} column
	 * @param {Number} row
	 * @param {Number} value 0 to 9, 0 meaning empty
	 */
	setValue: function(column, row, value) {
		this.rows[row][column] = value;
	},

	/**
	 * Does a specific cell conflict with another?
	 * @method
	 * @param {Number} column
	 * @param {Number} row
	 * @return {Boolean}
	 */
	cellConflicts: function(column, row) {
		var value = this.rows[row][column];
		
		if(value == 0)
			return false;
			
		for(var i = 0; i < 9; i++)
		{
			if(i != row && this.rows[i][column] == value) 
			{
				return true;
			}

			if(i != column && this.rows[row][i] == value)
			{
				return true;				
			}
		}

		//At this point, everything else is checked as valid except the 3x3 grid		
		return !this._miniGridValid(column, row);
	},
	
	/**
	 * Checks if the inner 3x3 grid a cell resides in is valid
	 * @method
	 * @private
	 * @param {Number} column
	 * @param {Number} row
	 * @return {Boolean}
	 */
	_miniGridValid: function(column, row) {		
		//Determine 3x3 grid position
		var mgX = Math.floor(column / 3);
		var mgY = Math.floor(row / 3);
		
		var startCol = mgX * 3;
		var startRow = mgY * 3;
		
		var endCol = (mgX + 1) * 3;
		var endRow = (mgY + 1) * 3;
		
		var numbers = [];
		for(var r = startRow; r < endRow; r++)
		{
			for(var c = startCol; c < endCol; c++)
			{
				var value = this.rows[r][c];
				if(value == 0)
					continue;
					
				for(var num = 0; num<numbers.length;num++){
				  if(numbers[num]==value){
				    return false;
				  }
				}
					
				numbers.push(value);			
			}
		}
		
		return true;
	},
	
	/**
	 * Return a string representation of the grid.
	 * @method
	 * @return {String}
	 */
	toString: function() {
		var str = '';
		for(var i = 0; i < 9; i++)
		{
			str += this.rows[i].join(' ') + "\r\n";
		}
		
		return str;
	},
	
	/**
	 * Return the puzzle as an array, for example for saving
	 * @method
     * @return {Array}
     */
	toArray: function() {
		var cells = [];
		for(var row = 0; row < 9; row++)
		{
			for(var col = 0; col < 9; col++)
				cells.push(this.rows[row][col]);
		}
		
		return cells;
	},
	
	/**
	 * Fill the puzzle from an array
	 * @method
	 * @param {Array} cells
	 * @return {CU.sudoku.Grid}
	 */
	fromArray: function(cells) {
		if(cells.length != 81)
			throw new Error('Array length is not 81');
			
		for(var i = 0; i < 81; i++)
		{
			var row = Math.floor(i / 9);
			var col = i - (row * 9);
			
			this.rows[row][col] = cells[i];
		}
		
		return this;
	}
};