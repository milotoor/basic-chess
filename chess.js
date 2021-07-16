/******************************************************************************
 *                                                                            *
 * TITLE:       Chess JavaScript File                                         *
 *                                                                            *
 * AUTHOR:      Milo Toor                                                     *
 *                                                                            *
 * DATE:        30 May 2011                                                   *
 *                                                                            *
 * DESCRIPTION: This is the JavaScript file to accompany the game of chess    *
 *              located and played in chess.html. This file contains          *
 *              literally all the dynamic aspects of the chess game and is    *
 *              thus the essential ingredient in the program's funcitonality. *
 *              Currently the code is organized logically under headers       *
 *              within this file. Were I inclined to do so I might separate   *
 *              the code under each header into a file of its own, then       *
 *              unite the various files here. At the moment I choose to       *
 *              leave all the code here. A table of contents is provided      *
 *              below.                                                        *
 *                                                                            *
 * LEGEND:      FUNCTION TYPE                LINE NUMBER                      *
 *              Global Items                 40                               *
 *              Hover Functions              85                               *
 *              Executive Function           122                              *
 *              Click Functions              416                              *
 *              Confirmation Functions       520                              *
 *              Move Validation Functions    738                              *
 *              Castling Functions           1037                             *
 *              Endgame Functions            1154                             *
 *              Commentary Functions         1305                             *
 *              Conversion Functions         1372                             *
 *              Move Guide Functions         1528                             *
 *              Undo Functions               1642                             *
 *              Notation Functions           1753                             *
 *              Auxiliary Functions          1913                             *
 *                                                                            *
 ******************************************************************************/


/******************************************************************************
 *** GLOBAL ITEMS ******************************************** GLOBAL ITEMS ***
 ******************************************************************************/

/* Initial state of the board. 0's represent an empty square.  *
 * IMPORTANT OBSERVATION: JavaScript is CASE SENSITIVE.        *
 * Lower case represents white pieces, and upper case          *
 * represents black pieces.                                    *
 *                                                             *
 *    LEGEND:                                                  *
 *      i:  pawn       j:  bishop                              *
 *      l:  rook       m:  queen                               *
 *      k:  knight     n:  king                                *
 *                                                             *
 * These letter choices are hard-wired into the Chess Alpha 2  *
 * font, and are not of my selection. They MAY NOT be changed. */
var board = [["L", "K", "J", "M", "N", "J", "K", "L"],
             ["I", "I", "I", "I", "I", "I", "I", "I"],
             ["0", "0", "0", "0", "0", "0", "0", "0"],
             ["0", "0", "0", "0", "0", "0", "0", "0"],
             ["0", "0", "0", "0", "0", "0", "0", "0"],
             ["0", "0", "0", "0", "0", "0", "0", "0"],
             ["i", "i", "i", "i", "i", "i", "i", "i"],
             ["l", "k", "j", "m", "n", "j", "k", "l"]];

var boardLength = board[0].length;

/* previousBoards is an array which will hold the previous      *
 * states of the board, so that a user may use the undo button. */
var previousBoards = [];

/* Several useful variables:                                       *
 *    'moveNo' tells us the turn number.                           *
 *    'selection' tells us the id (square number) of the piece     *
 *                that is selected, if there is one.               *
 *    'displayMoveGuide' tells us if the user has the move guide   *
 *                       option on or off.                         *
 *    'displayInstr'  tells us if the user would like instructions *
 *                    for the selected piece.                      */
var moveNo    		 = 1;
var selection 		 = "";
var displayMoveGuide = false;
var displayInstr     = false;


/******************************************************************************
 *** HOVER FUNCTIONS ************************************** HOVER FUNCTIONS ***
 ******************************************************************************/

/* Function to make the background color of playable pieces *
 * change when hovered over.                                */
function hover(id)
{
   /* We only activate 'hover' if the square we are hovering *
    * over is not the currently selected piece.              */
   if (id != selection) {
      var element = document.getElementById(id);
      
      /* When a playable piece is hovered over, we change the background *
       * color and the pointer.                                          */
      element.setAttribute('style',
                           'background-color: #ffffe9; cursor: pointer;');
      element.setAttribute('onMouseOut', 'unHover(id)');
   }
   
   return;
}

// Function to remove the hover effect when the user un-hovers. //
function unHover(id)
{
   /* Likewise, we only activate unHover if the square in   *
    * in question is not selected one.                      */
   if (id != selection) {
      var element = document.getElementById(id);
      element.setAttribute('style', '');
   }
   
   return;
}


/******************************************************************************
 *** EXECUTIVE FUNCTIONS ****************************** EXECUTIVE FUNCTIONS ***
 ******************************************************************************/

/* updateBoard takes care of all the logistical work behind every *
 * move. It updates both the matrix-board and the visual-board,   *
 * augments the number of moves, renders the updated version of   *
 * the game, and updates the piece grave yard.                    */
function updateBoard(idCur, idMov)
{
   /* These variables dictate where the currently selected piece *
    * is, and where we are trying to move it.                    */
   var coordsMov = idToCoords(idMov);
   var rowNumMov = coordsMov[0];
   var colNumMov = coordsMov[1];
   
   var coordsCur = idToCoords(idCur);
   var rowNumCur = coordsCur[0];
   var colNumCur = coordsCur[1];
   
   // The characters on the two relevant squares. //
   var pieceMov = board[rowNumMov][colNumMov];
   var pieceCur = board[rowNumCur][colNumCur];
   
   // And, update the board! //
   board[rowNumMov][colNumMov] = pieceCur;
   board[rowNumCur][colNumCur] = "0";
   
   /* Additional check, to see if the move was a castle, in which *
    * case we need to move the rook too.                          */
   if (pieceCur == 'n') {                    // White king is moving. //
      if (colNumCur - colNumMov == 2) {      // Castling to left. //
         board[rowNumMov][colNumMov + 1] = "l";
         board[rowNumMov][0] = "0";
         hasMovedWhiteRookL  = true;
      }
      
      else if (colNumMov - colNumCur == 2) { // Castling to right. //
         board[rowNumMov][colNumMov - 1] = "l";
         board[rowNumMov][boardLength - 1] = "0";
         hasMovedWhiteRookR = true;
      }
   }
   
   else if (pieceCur == 'N') {               // Black king is moving. //
      if (colNumCur - colNumMov == 2) {      // Castling to left. //
         board[rowNumMov][colNumMov + 1] = "L";
         board[rowNumMov][0] = "0";
         hasMovedBlackRookL  = true;
      }
      
      else if (colNumMov - colNumCur == 2) { // Castling to right. //
         board[rowNumMov][colNumMov - 1] = "L";
         board[rowNumMov][boardLength - 1] = "0";
         hasMovedBlackRookR = true;
      }
   }
   
   // Check to see if a pawn reached the other end. //
   if (pieceCur  == 'i' && 
       rowNumMov == 0)                 // White pawn reached end.
      board[rowNumMov][colNumMov] = "m";
   
   if (pieceCur  == 'I' &&
       rowNumMov == boardLength - 1)   // Black pawn reached end.
       board[rowNumMov][colNumMov] = "M";
   
   // Update the visual representation of the board. //
   moveNo += 1;
   render(board, moveNo);

   // If a piece was killed by the move, reflect this. //
   if (pieceMov != "0")
      updateGraveyard(pieceMov, "in");
   
   // Reset the selection. //
   document.getElementById(selection).setAttribute('style', '');
   document.getElementById("board").setAttribute('style', '');
   selection = "";
   
   // If move guide is on, update it (by erasing the highlights). //
   if (displayMoveGuide)
      updateMoveGuide();
   
   addNotation(pieceCur, pieceMov, rowNumMov,
               colNumMov, rowNumCur, colNumCur);
   
   /* Variable to represent the current player's color. Necessary    *
    * for isStalemate() and isCheckmate(). I inverse the colors      *
    * because we want to determine if the OTHER player is checkmated *
    * or stalemated by the move just made.                           */
   var color;
   if (isWhitePiece(pieceCur))
      color = 'b';
   else
      color = 'w';
   
   // If the game is now in stalemate, end it. //
   if(isStalemate(color))
      endGame("stalemate", color);
   
   // Alternatively, if the other player is now checkmated, end the game. //
   if(isCheckmate(color))
      endGame("checkmate", color);
   
   return;
}

/* render is responsible for updating the visual representation *
 * of the chess game. After a move is made and confirmed valid, *
 * and after the appropriate change is made to the internal     *
 * matrix-board, we need to update the visual board as well,    *
 * along with the accompanying HTML. If white made the move     *
 * being rendered, we now need to hand control to black, which  *
 * means a lot of changes need to be made to the onClick()      *
 * calls, as well as the onMouseOver() calls.                   */
function render(chessBoard, moveCount)
{
   /* First we will update whose turn it is. An odd number of *
    * moves indicates it's white's turn, and an even number   *
    * indicates it's black's turn.                            */
   var whoseMove;
   if ((moveCount % 2) == 1) // Odd numbered turn, white's move. //
      whoseMove = "White";
   else                      // Even numbered turn, black's move. //
      whoseMove = "Black";
      
   // Update whose turn it is. //
   document.getElementById("whoseMove").innerHTML=whoseMove+"'s Move";
   
   /* Now we need to scroll through every square of the board, *
    * one by one, replacing the current content of the square, *
    * the onClick() calls and the onMouseOver() calls.         */
   var colLetter;
   var rowNumber;
   var id;
   for (row = 0; row < boardLength; ++row) {
      for (col = 0; col < boardLength; ++col) {

         // First, identify the square by its id. //
         id = coordsToId(row, col);
         
         /* Now, update that square's content. Keep in mind *
          * we don't want to do this if the content is a 0. */
         if (chessBoard[row][col] != "0")
            document.getElementById(id).innerHTML = chessBoard[row][col];
         else
            document.getElementById(id).innerHTML = "";

         /* Update the square's onMouseOver() and onClick() calls.   *
          * If the square is now home to a piece belonging to the    *
          * player whose turn it is, onMouseOver() should call       *
          * hover(), and otherwise onMouseOver() should do nothing.  *
          * For these same squares, onClick() should call choose,    *
          * and for all other squares it should call move().         *
          *                                                          *
          * NOTE: At the moment I am reusing the line                *
          *                                                          *
          *    document.getElementById(id)                           *
          *                                                          *
          * about a thousand times instead of declaring a variable   *
          * to represent it. This is because, for some reason, I     *
          * have had endless trouble trying to make JavaScript       *
          * assign the same variable more than one HTML element, and *
          * have been unable to generate code that will work when    *
          * run through a loop. This problem is UNRESOLVED.          */
         
         if (whoseMove == "White") {                     // White's turn. //
            if (isWhitePiece(chessBoard[row][col])) {    // On a white piece. //
               document.getElementById(id).setAttribute('onClick',
                                                        'choose("'+id+'")');
               document.getElementById(id).setAttribute('onMouseOver',
                                                        'hover("'+id+'")');
            }
            
            else {                                   // Not on a white piece. //
               document.getElementById(id).setAttribute('onClick',
                                                        'move("'+id+'")');
               document.getElementById(id).setAttribute('onMouseOver',
                                                        '');
            }
         }
         
         else {                                          // Black's turn.
            if (isBlackPiece(chessBoard[row][col])) {    // On a black piece. //
               document.getElementById(id).setAttribute('onClick',
                                                        'choose("'+id+'")');
               document.getElementById(id).setAttribute('onMouseOver',
                                                        'hover("'+id+'")');
            }
            
            else {                                   // Not on a black piece. //
               document.getElementById(id).setAttribute('onClick',
                                                        'move("'+id+'")');
               document.getElementById(id).setAttribute('onMouseOver',
                                                        ''); 
            }
         }
      }
   }
   
  /* Finally, remove the informational text, and *
   * king-check warning, if there is one.        */
   updateCommentary("");
   kingCheck(0);
   return;
}

/* The game-ending function. This function does no real evaluation *
 * to determine if the game is over. Instead, evaluation is done   *
 * by the functions isStalemate() or isCheckmate(), and if either  *
 * of these things returns true, updateBoard() calls endGame to    *
 * do exactly what its name suggests.                              */
function endGame(type, color)
{
   /* These declarations might look odd. The color attribute  *
    * will only be used to announce who has won the game (in  *
    * the case of a checkmate). It's important to recall that *
    * in updateGame (endGame's calling function), color is    *
    * used to represent the player who has been checkmated.   *
    * Hence, here we reverse the color.                       */
   if (color == 'w')
      color = 'Black';
   else
      color = 'White';
   
   // Inform the user. //
   var comHead = document.getElementById("comHead");
   if (type == "stalemate")
      comHead.innerHTML = "Stalemate!";
   else if(type == "checkmate")
      comHead.innerHTML = "Checkmate! "+color+" wins!";
   
   document.getElementById("whoseMove").innerHTML="";
   
   // Then remove all the JavaScript options from the board. //
   var row;
   var col;
   var id;
   for (row = 0; row < boardLength; ++row) {
      for (col = 0; col < boardLength; ++col) {
         id     = coordsToId(row, col);
         square = document.getElementById(id);

         square.setAttribute('onMouseOver', '');
         square.setAttribute('onClick', '');
      }
   }
}
   

/* updateGraveyard takes in a character representing a killed *
 * piece and places it in the appropriate graveyard. Pawns go *
 * in a player's inner graveyard, and all other pieces go in  *
 * a player's outer graveyard. The direction argument enables *
 * us to both add and remove pieces from the graveyard (we    *
 * may wish to remove pieces in the event of undoing a move). */
function updateGraveyard(piece, direction)
{
   /* graveyard will represent the table cell we need to update, *
    * and alreadyDead will contain the pieces already within     *
    * that graveyard.                                            */
   var graveyard;
   var alreadyDead;
   
   if (isWhitePiece(piece)) { // If the piece is white... //
      if(piece == "i")        // White pawn. //
         graveyard = document.getElementById("whiteInnerGraveyard");
      
      else                    // Other white piece. //
         graveyard = document.getElementById("whiteOuterGraveyard");
   }
   
   else {                     // The piece is black... //
      if(piece == "I")        // Black pawn. //
         graveyard = document.getElementById("blackInnerGraveyard");
      
      else                    // Other black piece. //
         graveyard = document.getElementById("blackOuterGraveyard");
   }
   
   /* Now that we know what graveyard we're dealing with, grab *
    * the pieces currently in that graveyard and then update.  */
   alreadyDead = graveyard.innerHTML;
   
   if (direction == "in")
      graveyard.innerHTML = alreadyDead + piece;
   else
      graveyard.innerHTML = alreadyDead.substring(0, alreadyDead.length - 1);
      
   return;
}
   

/******************************************************************************
 *** CLICK FUNCTIONS ************************************** CLICK FUNCTIONS ***
 ******************************************************************************/

/* choose is responsible for the logistics involved in clicking on *
 * a playable piece. If a player clicks on one of their pieces,    *
 * that piece's background color changes, the move guide changes,  *
 * and the cursor is made into a pointer. choose handles all this. */
function choose(id)
{
   var element = document.getElementById(id);
   
   /* If we're clicking the same square, then we want to deselect *
    * the piece.                                                  */
   if (id == selection) {
      unChoose("choose")
      return;
   }
   
   /* If we're selecting a different square, then we first want  *
    * to fix the already selected square, update the selection   *
    * variables, and change the background color of our newly    *
    * selected piece. The if is there so that when we first make *
    * a selection we don't attempt to reset a previous           *
    * (nonexistent) selection.                                   */
   if (selection != "") {
      var oldElem = document.getElementById(selection);
      oldElem.setAttribute('style', '');
   }
   
   selection = id;
   
   var board = document.getElementById("board");
   element.setAttribute('style', 'background-color: #aaccff;');
   board.setAttribute('style', 'cursor: pointer;');
   
   if (displayMoveGuide)
      updateMoveGuide(id);
   
   updateCommentary(selection);
   return;
}

// Function for deselecting a piece. //
function unChoose(calledBy)
{
   var element = document.getElementById(selection);
   
  /* If unChoose was called by choose(), then we want  *
   * to set the element's cursor to pointer. However,  *
   * if unChoose was called by undo(), then we want to *
   * set the element's style to nothing.               */
   element.setAttribute('style', '');
   if (calledBy == "choose")
      element.setAttribute('style', 'cursor: pointer;');
   
  /* In either case, we also want to clear the selection variables *
   * and set the board's style back to normal.                     */
   document.getElementById("board").setAttribute('style', '');
   selection = "";
   
   if (displayMoveGuide)
      updateMoveGuide(selection);
   
   updateCommentary(selection);
   return;
}

/* After a player selects a piece (handled by choose()), the       *
 * player may then wish to move the piece. This option, and all    *
 * the various baggage that comes with it, is handled by move.     *
 * move not only ensures that a move is valid, it also makes       *
 * several calls to update the array of previous boards (necessary *
 * for the undo function), to update the castling variables, and   *
 * to update the board itself.                                     */
function move(id)
{
   /* If selection is the empty string, there's no piece selected, *
    * so just stop right there.                                    */
   if (selection == "")
      return;
   
   // First we must check that the move is valid. //
   if (checkValid(selection, id, board, "move")) {
      
      // Coordinates representing the two squares of interest. //
      var coordsMov = idToCoords(id);
      var coordsCur = idToCoords(selection);

      // Update the array of previous moves. //
      updateUndo(coordsMov[0], coordsMov[1]);
      
      // Update the castling variables. //
      updateCastleVariables(coordsCur[0], coordsCur[1]);
      
      // And finally, update the board.
      updateBoard(selection, id);
   }
   
   return; // The deed is done. //
}



/******************************************************************************
 *** CONFIRMATION FUNCTIONS ************************ CONFIRMATION FUNCTIONS ***
 ******************************************************************************/

/* checkValid takes in the id of a square the current player is          *
 * attempting to move a selected piece to. It confirms, through lengthy  *
 * conditional checking, that the move is valid. This code is very       *
 * long and, as mentioned, highly conditional, but this is the nature    *
 * of chess and there really is no work around. Also, for clarification, *
 * the calledBy parameter is merely there so that, in case checkValid is *
 * being called by the updateMoveGuide(), isStalemate() or isCheckmate() *
 * functions -- all of which are call checkValid() based on hypothetical *
 * moves and not moves the user is requesting -- we do not bother to     *
 * throw kingCheck exceptions.                                           */
function checkValid(selected, id, chessBoard, calledBy)
{
   /* These variables dictate where the currently selected piece *
    * is, and where we are trying to move it.                    */
   var coordsMov = idToCoords(id);
   var rowNumMov = coordsMov[0];
   var colNumMov = coordsMov[1];
   
   var coordsCur = idToCoords(selected);
   var rowNumCur = coordsCur[0];
   var colNumCur = coordsCur[1];
   
   // First we find which pieces we are dealing with. //
   var pieceMov = getPieceID(id);
   var pieceCur = getPieceID(selected);

   /* Declare a boolean variable, then branch. isValid, unsurprisingly, *
    * will hold whether or not the proposed move is possible without    *
    * taking into consideration whether or not the move endangers the   *
    * player's king.                                                    */
   var isValid;
   switch(pieceCur) {
      case 'i':      // WHITE PAWN //
         isValid =  validatePawn(colNumMov, colNumCur,
                                 rowNumMov, rowNumCur, 'w', chessBoard);
         break;
         
      case 'I':      // BLACK PAWN //
         isValid =  validatePawn(colNumMov, colNumCur,
                                 rowNumMov, rowNumCur, 'b', chessBoard);
         break;
         
      case 'l':      // WHITE ROOK //
         isValid =  validateRook(colNumMov, colNumCur,
                                 rowNumMov, rowNumCur, 'w', chessBoard);
         break;
         
      case 'L':      // BLACK ROOK //
         isValid = validateRook(colNumMov, colNumCur,
                                rowNumMov, rowNumCur, 'b', chessBoard);
         break;
         
      case 'k':      // WHITE KNIGHT //
         isValid = validateKnight(colNumMov, colNumCur,
                                  rowNumMov, rowNumCur, 'w', chessBoard);
         break;
         
      case 'K':      // BLACK KNIGHT //
         isValid = validateKnight(colNumMov, colNumCur,
                                  rowNumMov, rowNumCur, 'b', chessBoard);
         break;
         
      case 'j':      // WHITE BISHOP //
         isValid = validateBishop(colNumMov, colNumCur,
                                  rowNumMov, rowNumCur, 'w', chessBoard);
         break;
         
      case 'J':      // BLACK BISHOP //
         isValid = validateBishop(colNumMov, colNumCur,
                                  rowNumMov, rowNumCur, 'b', chessBoard);
         break;
         
      case 'm':      // WHITE QUEEN //
         isValid = validateQueen(colNumMov, colNumCur,
                                 rowNumMov, rowNumCur, 'w', chessBoard);
         break;
         
      case 'M':      // BLACK QUEEN //
         isValid = validateQueen(colNumMov, colNumCur,
                                 rowNumMov, rowNumCur, 'b', chessBoard);
         break;
         
      case 'n':      // WHITE KING //
         isValid = validateKing(colNumMov, colNumCur,
                                rowNumMov, rowNumCur, 'w', chessBoard);
         break;
         
      case 'N':      // BLACK KING //
         isValid = validateKing(colNumMov, colNumCur,
                                rowNumMov, rowNumCur, 'b', chessBoard);
         break;
   }
   
   if (!isValid)
      return false;
      
   /* Now that we know that the move is feasible, we need to     *
    * confirm that the player is not endangering their king by   *
    * making the move. That means that, if the king is currently *
    * in check before the move, the player cannot ignore this,   *
    * and it also means they cannot make a move that would put   *
    * their king in check. To make these judgements, I need to   *
    * advance the board according to the current move, and to do *
    * so I use a copy of the board.                              */
   var tempBoard = copyBoard();
   
   // Update the imaginary board with the new move. //
   tempBoard[rowNumMov][colNumMov] = tempBoard[rowNumCur][colNumCur];
   tempBoard[rowNumCur][colNumCur] = "0";
   
   /* Before we make the actual checks, we need to know *
    * the moving player's color (for underAttack())     */
   var color;
   if (isWhitePiece(tempBoard[rowNumMov][colNumMov]))
      color = 'w';
   else
      color = 'b';
   
   var kingIDNow        = findKing(color, board);
   var kingIDAfter      = findKing(color, tempBoard)
   var kingInCheckNow   = underAttack(color, kingIDNow, board);
   var kingInCheckAfter = underAttack(color, kingIDAfter, tempBoard);
   
   /* If the king is in check right now and he remains in check *
    * after the move, we call the 1st king-check error.         */
   if (kingInCheckNow && kingInCheckAfter) {
      if(calledBy != "moveGuide" &&
         calledBy != "stalemate" &&
         calledBy != "checkmate")
         kingCheck(1);
      return false;
   }
   
   /* If the king is not in check right now but is in check after *
    * the move, we call the 2nd king-check error.                 */
   else if (!kingInCheckNow && kingInCheckAfter) {
      if(calledBy != "moveGuide" &&
         calledBy != "stalemate" &&
         calledBy != "checkmate")
         kingCheck(2);
      return false;
   }
   
   return true; // The move is valid! //
}

/* underAttack returns true or false depending on whether the given   *
 * color is under attack on the given square.                         */
function underAttack(color, square, chessBoard)
{
   /* The methodology is simple: Loop through every square on the board. *
    * If you find a piece of the opposing color, check to see if that    *
    * piece can attack the given square by using checkValid().           */
   var row;
   var col;
   var id;
   for (row = 0; row < boardLength; ++row) {
      for (col = 0; col < boardLength; ++col) {
         
         // The player is white and the square holds a black piece. //
         if (color == 'w' && isBlackPiece(chessBoard[row][col])) {
            // First, identify the square by it's id. //
            id = coordsToId(row, col);
            
            /* Check if the piece can attack the square. If it can, *
             * return true.                                         */
            if (checkValid(id, square, chessBoard, "underAttack"))
               return true;
         }
         
         else if (color == 'b' && isWhitePiece(chessBoard[row][col])) {
            id = coordsToId(row, col);
            
            /* Check if the piece can attack the square. If it can, *
             * return true.                                         */
            if (checkValid(id, square, chessBoard, "underAttack"))
               return true;
         }
      }
   }
   
   /* We've scrolled through the whole board and no *
    * piece could attack the square.                */
   return false;
}

// A simple function that determines if a given character is a white piece. //
function isWhitePiece(char)
{
   var whitePieces = ["i", "l", "k", "j", "m", "n"];
   
   for (i = 0; i < whitePieces.length; ++i) {
      if (char == whitePieces[i])
         return true;
   }
   
   return false; // The character is not a white piece. //
}

// Same function as isWhitePiece(), except for black pieces. //
function isBlackPiece(char)
{
   var blackPieces = ["I", "L", "K", "J", "M", "N"];
   
   for (i = 0; i < blackPieces.length; ++i) {
      if (char == blackPieces[i])
         return true;
   }
   
   return false; // The character is not a black piece. //
}



/******************************************************************************
 *** MOVE VALIDATION FUNCTIONS ****************** MOVE VALIDATION FUNCTIONS ***
 ******************************************************************************/

/* All of the following functions take in the board-coordinates of the *
 * currently selected piece and a location where this piece is trying  *
 * to move. They then confirm (or deny) that this location is a valid  *
 * one according to the rules of chess. For the sake of reusing code,  *
 * the functions also accept a 'color' parameter, permitting us to     *
 * handle both white and black moves in one function.                  */

// Validate a pawn's move. //
function validatePawn(colNumMov, colNumCur,
                      rowNumMov, rowNumCur, color, chessBoard)
{
   var pieceMov = chessBoard[rowNumMov][colNumMov];
   
   /* In order to handle both white and black pawn movements, we *
    * need to be able to switch the magnitude of                 *
    * rowNumCur - rowNumMov on several occasions.                */
   var colorMultiplier;
   
   /* We also need to distinguish between the row number of the pawn's *
    * first row.                                                       */
   var origRow;
   
   // If the given color is white, do nothing. Otherwise, switch magnitude. //
   if (color == 'w') {
      colorMultiplier = 1;
      origRow = 6;
   }
   
   else if(color == 'b') {
      colorMultiplier = -1;
      origRow = 1;
   }
   
   // If neither of the first two cases triggered, something went wrong. //
   else {
      postError(2);
      return false;
   }
   
   /* This conditional confirms location. The pawn's movement  *
    * can either be one or two spaces forward (the first three *
    * conditions), or it can be one space forward, one space   *
    * diagonally. (the last two conditons)                     */
   if (((colNumCur == colNumMov) &&
        (((rowNumCur - rowNumMov)*colorMultiplier == 1) ||
         ((rowNumCur - rowNumMov)*colorMultiplier == 2))) ||
       (((rowNumCur - rowNumMov)*colorMultiplier == 1) &&
        (Math.abs(colNumCur - colNumMov) == 1))) {
   
     /* This conditional confirms the pawn's move is valid when  *
      * the player is moving one or two steps forward. Note that *
      * the player can move a pawn two steps forward only if the *
      * pawn has not moved.                                      */
      if ((colNumCur == colNumMov) &&
          (pieceMov == "0") &&
          (((rowNumCur - rowNumMov)*colorMultiplier == 1) ||
           (((rowNumCur - rowNumMov)*colorMultiplier == 2) &&
            (rowNumCur == origRow) &&
            chessBoard[rowNumCur - 1*colorMultiplier][colNumCur] == "0")))
         return true;
          
     /* Finally, the only other valid move is if the pawn is *
      * moving one space diagonally to attack an opponent's  *
      * piece.                                               */
      else if (((rowNumCur - rowNumMov)*colorMultiplier == 1) &&
               (Math.abs(colNumCur - colNumMov) == 1))
         if ((color == 'w' && isBlackPiece(pieceMov)) ||
             (color == 'b' && isWhitePiece(pieceMov)))
         return true;
       }
   
   return false;  // Not a valid move. //
}

// Validate a rook's move. //
function validateRook(colNumMov, colNumCur,
                      rowNumMov, rowNumCur, color, chessBoard)
{
   /* If there is a piece at the destination, and it isn't capturable, *
    * then the move is not valid. I include this condition first so    *
    * that now I need only confirm that the location is a valid one.   */
   var pieceAtLocation = chessBoard[rowNumMov][colNumMov];
   if (pieceAtLocation != "0")
      if ((color == 'w' && !isBlackPiece(pieceAtLocation)) ||
          (color == 'b' && !isWhitePiece(pieceAtLocation)))
         return false;
   
   /* Confirm location. Rooks can only move straight up and down *
    * or straight left and right, so either the column number    *
    * won't change or the row number won't.                      */
   if (!((colNumMov == colNumCur) ||
         (rowNumMov == rowNumCur)))
      return false;
      
   if (colNumMov != colNumCur) {    // Rook is moving horizontally. //
      
      /* Logic: If there is anything but a 0 between the current *
       * location and the destination, then the move is invalid  *
       * as the rook is trying to move through another piece.    */
      var col;
      var startCol = Math.min(colNumCur, colNumMov);
      var endCol   = Math.max(colNumCur, colNumMov);
      
      for (col = startCol + 1; col < endCol; ++col)
         if (chessBoard[rowNumMov][col] != "0")
            return false;
   }
   
   else {                           // Rook is moving vertically. //
        
      // Same logic as above. //
      var row;
      var startRow = Math.min(rowNumCur, rowNumMov);
      var endRow   = Math.max(rowNumCur, rowNumMov);
      
      for (row = startRow + 1; row < endRow; ++ row)
         if (chessBoard[row][colNumMov] != "0")
            return false;
   }
   
   /* At this point, we have confirmed that the rook does not move  *
    * through any pieces, and that the location it is trying to     *
    * move to is either empty or is occupied by a capturable piece. *
    * Hence, the move is valid, so return true.                     */
   return true;
}

// Validate a knight's move. //
function validateKnight(colNumMov, colNumCur,
                        rowNumMov, rowNumCur, color, chessBoard)
{
   /* If there is a piece at the destination, and it isn't capturable, *
    * then the move is not valid. I include this condition first so    *
    * that now I need only confirm that the location is a valid one.   */
   var pieceAtLocation = chessBoard[rowNumMov][colNumMov];
   if (pieceAtLocation != "0")
      if ((color == 'w' && !isBlackPiece(pieceAtLocation)) ||
          (color == 'b' && !isWhitePiece(pieceAtLocation)))
         return false;
   
   /* The move is valid if the knight is moving in an 'L' fashion, that  *
    * is, if the knight is moving two spaces up or down and one space    *
    * left or right (first two conditions) or if it is moving two spaces *
    * left or right and one space up or down (last two conditions).      */
   if (((Math.abs(rowNumMov - rowNumCur) == 2) &&
        (Math.abs(colNumMov - colNumCur) == 1)) ||
       ((Math.abs(rowNumMov - rowNumCur) == 1) &&
        (Math.abs(colNumMov - colNumCur) == 2)))
      return true;
   
   return false;  // Not a valid move. //
}

// Validate a bishop's move. //
function validateBishop(colNumMov, colNumCur,
                        rowNumMov, rowNumCur, color, chessBoard)
{
   /* First confirm that the location is either empty or is occupied *
    * by a piece of the opposite color.                              */
   var pieceAtLocation = chessBoard[rowNumMov][colNumMov];
   if (pieceAtLocation != "0")
      if ((color == 'w' && !isBlackPiece(pieceAtLocation)) ||
          (color == 'b' && !isWhitePiece(pieceAtLocation)))
         return false;
   
   /* The bishop can only move diagonally, meaning that the number *
    * of spaces it travels up or down needs to equal the number    *
    * of spaces it travels left or right.                          */
   if (!(Math.abs(rowNumMov - rowNumCur) ==
       Math.abs(colNumMov - colNumCur)))
      return false;
      
   // Represents how far the bishop travels diagonally. //
   var distance = Math.abs(rowNumMov - rowNumCur);
   var index;
   
   var startRow;
   var startCol = Math.min(colNumMov, colNumCur);
   
   /* Logic: If there is anything but a 0 between the current *
    * location and the destination, then the move is invalid  *
    * as the bishop is trying to move through another piece.  */
   
   /* This conditional tests if the bishop is moving up-left or *
    * down-right. If the bishop moves in one of these two ways, *
    * then the column number and the row number either both     *
    * increase or both decrease as the bishop moves.            */
   if ((rowNumMov > rowNumCur && colNumMov > colNumCur) ||
       (rowNumMov < rowNumCur && colNumMov < colNumCur)) {
      
      startRow = Math.min(rowNumMov, rowNumCur);
      for (index = 1; index < distance; ++index)
         if (chessBoard[startRow + index][startCol + index] != "0")
            return false;
   }
   
   /* Otherwise, the bishop is moving up-right or down-left, in   *
    * which case the column number and row number will not change *
    * in the same direction.                                      */
   else {
      
      startRow = Math.max(rowNumMov, rowNumCur);
      for (index = 1; index < distance; ++index)
         if (chessBoard[startRow - index][startCol + index] != "0")
            return false;
   }
   
   /* At this point, we have confirmed that the bishop does not move *
    * through any pieces, and that the location it is trying to      *
    * move to is either empty or is occupied by a capturable piece.  *
    * Hence, the move is valid, so return true.                      */
   return true;
}

// Validate a queen's move. //
function validateQueen(colNumMov, colNumCur,
                       rowNumMov, rowNumCur, color, chessBoard)
{
   /* Note: a queen is essentially the same thing as a rook and *
    * bishop combined. The queen can move in any direction --   *
    * up, down, left, right or diagonally -- in as many spaces  *
    * as possible. A bishop can move diagonally as many spaces  *
    * as possible, and a rook can move up, down, left or right  *
    * as many spaces as possible. Hence, combining the rook and *
    * the bishop yields the functionality of the queen.         */
   
   return (validateRook(colNumMov, colNumCur,
                        rowNumMov, rowNumCur, color, chessBoard) ||
           validateBishop(colNumMov, colNumCur,
                          rowNumMov, rowNumCur, color, chessBoard));
}

// Validate a king's move. //
function validateKing(colNumMov, colNumCur,
                      rowNumMov, rowNumCur, color, chessBoard)
{
   /* First confirm that the location is either empty or is occupied *
    * by a piece of the opposite color.                              */
   var pieceAtLocation = chessBoard[rowNumMov][colNumMov];
   if (pieceAtLocation != "0")
      if ((color == 'w' && !isBlackPiece(pieceAtLocation)) ||
          (color == 'b' && !isWhitePiece(pieceAtLocation)))
         return false;
   
   /* There is one stipulation that I need to get out of the way         *
    * before anything else. Due to the way I have structured             *
    * the code, if a player has the move guide on and they attempt       *
    * to move a king onto a square which the other king can attack, an   *
    * infinite loop is triggered (checkValid() calls underAttack() which *
    * calls checkValid, etc). An easy way around this dilemma is by      *
    * simply making the restriction that a player can not move a king    *
    * to a square already adjacent to the other king.                    */
   var row;
   var col;
   for (row = rowNumMov - 1; row <= rowNumMov + 1; ++row) {
      // Make sure that the row index is not beyond the array's index. //
      if (row < 0 || row > boardLength - 1)
         continue;
      
      for (col = colNumMov - 1; col <= colNumMov + 1; ++col) {
         // Same for the column index. //
         if (col < 0 || col > boardLength - 1)
            continue;
         
         // If it's white's turn and there's a black king nearby.. //
         if (color == 'w' && chessBoard[row][col] == 'N')
            return false;
         
         // Otherwise, if it's black's turn and there's a white king nearby.. //
         else if (color == 'b' && chessBoard[row][col] == 'n')
            return false;
      }
   }
   
   /* The king can only move one square at a time, in any direction  *
    * (unless the player is castling -- see below). Hence, while the *
    * row number or the column number of the king might not change,  *
    * it will *never* change by more than one.                       */
   if (!((colNumMov == colNumCur) && (rowNumMov == rowNumCur)) &&
       (Math.abs(colNumMov - colNumCur) <= 1) &&
       (Math.abs(rowNumMov - rowNumCur) <= 1))
      return true;

   // The king can also potentially castle, so check for that as well. //
   if (rowNumMov == rowNumCur)
      if (((colNumMov - colNumCur == 2) &&
           canCastle(color, 'R')) ||
          ((colNumCur - colNumMov == 2) &&
           canCastle(color, 'L')))
         return true
   
   return false;  // Not a valid move. //
}


/******************************************************************************
 *** CASTLING FUNCTIONS ******************************** CASTLING FUNCTIONS ***
 ******************************************************************************/

/* Bunch of variables tracking whether either king or any rook *
 * has moved yet.                                              */
var hasMovedWhiteKing  = false;
var hasMovedBlackKing  = false;
var hasMovedWhiteRookL = false;
var hasMovedWhiteRookR = false;
var hasMovedBlackRookL = false;
var hasMovedBlackRookR = false;

/* canCastle takes in the color of a king a letter, either    *
 * R or L, and returns if the king can castle with this rook. */
function canCastle(color, rookSide)
{
   // If the king has moved, then you cannot castle. //
   if ((color == 'w' && hasMovedWhiteKing) ||
       (color == 'b' && hasMovedBlackKing))
      return false;
   
   // If the rook has moved, then you cannot castle. //
   if (color == 'w') {
      if ((rookSide == 'L' && hasMovedWhiteRookL) ||
          (rookSide == 'R' && hasMovedWhiteRookR))
         return false;
   }
   
   else {
      if ((rookSide == 'L' && hasMovedBlackRookL) ||
          (rookSide == 'R' && hasMovedBlackRookR))
         return false;
   }
   
   var kingID     = findKing(color, board);
   var kingCoords = idToCoords(kingID);
   var endCol;
   var rookCol;
   
   /* King moves two spaces to the left if he's castling with     *
    * the left rook, and two spaces to the right if he's castling *
    * with the right rook.                                        */
   if (rookSide == 'L') {
      endCol  = kingCoords[1] - 2;
      rookCol = 0;
   }
   
   else {
      endCol  = kingCoords[1] + 2;
      rookCol = boardLength - 1;
   }
   
   /* If any square between the king and the ending square, *
    * inclusive, is under attack, then you cannot castle.   */
   var index;
   var square;
   for (index = Math.min(endCol, kingCoords[1]);
        index <= Math.min(endCol, kingCoords[1]) + 3; ++index) {
      
      square = coordsToId(kingCoords[0], index);
      if (underAttack(color, square, board))
         return false;
   }
   
   
   /* If there are any pieces between the rook and the king, *
    * then you cannot castle.                                */
   for (index = Math.min(rookCol, kingCoords[1]) + 1;
        index < Math.max(rookCol, kingCoords[1]); ++index)
      if (board[kingCoords[0]][index] != "0")
         return false;
      
   /* We have confirmed that the king has never moved, the   *
    * rook has never moved, the king is not in check before, *
    * during, or after castling, and that there are no       *
    * pieces between the rook and the king. Hence castling   *
    * is a legal move.                                       */
    return true;
}

// Simple function to ensure the castle variables are updated properly. //
function updateCastleVariables(row, col)
{
   var piece = board[row][col];
   
   // Check if a king is moving. //
   if (piece == 'n')      // White king is moved. //
      hasMovedWhiteKing = true;
   
   else if (piece == 'N') // Black king is moved. //
      hasMovedBlackKing = true;
   
   /* Check if a rook is moving. Note that, after a rook  *
    * is initially moved we have no way of identifying it *
    * as the original right or left rook. Hence I use the *
    * more naive (but equally valid) approach of simply   *
    * checking if row and column correspond to one of the *
    * corners of the board, in which case a castle is     *
    * either being moved, or else some other piece is     *
    * moving from that spot, implying that the castle     *
    * already moved or else was killed (in which case who *
    * cares anyway...).                                   */
   if (row == 0 && col == 0)                    // Left black rook. //
      hasMovedBlackRookL = true;
   else if (row == 0 && col == boardLength - 1) // Right black rook. //
      hasMovedBlackRookR = true;
   else if (row == boardLength - 1 && col == 0) // Left white rook. //
      hasMovedWhiteRookL = true;
   else if (row == boardLength - 1 &&
            col == boardLength - 1)          // Right black rook. //
      hasMovedWhiteRookR = true;
   
   return;
}


/******************************************************************************
 *** ENDGAME FUNCTIONS ********************************** ENDGAME FUNCTIONS ***
 ******************************************************************************/

/* The following functions are to confirm that a game is over. A       *
 * game of chess can end two ways: in a checkmate or in stalemate.     *
 * A checkmate occurs when one player's king is in check and the king  *
 * cannot be removed from check via any move from any piece of         *
 * the king's color. A stalemate occurs when a player is NOT in check, *
 * but the player has no available moves.                              */

/* Helper function to determine if the game is stalemated. *
 * The color parameter refers to the player whose move it  *
 * is.                                                     */
function isStalemate(color)
{
   // First confirm that the king is not in check.
   var kingID = findKing(color, board);
   if (underAttack(color, kingID, board))
      return false;
   
   /* Before checking for the ordinary stalemate -- player cannot *
    * make a move -- I'll check for the less common one: when     *
    * the only pieces left are the two kings. In this case,       *
    * although both players can always still move, they can never *
    * end the game via checkmate, so the game is essentially a    *
    * never ending stalemate. This check will simply declare it   *
    * a stalemate anyway.                                         */
   var zeroCount = 0;
   var row;
   var col
   for (row = 0; row < boardLength; ++row)
      for (col = 0; col < boardLength; ++col)
         if (board[row][col] == "0")
            ++zeroCount;
   
   /* If every square but two are zeros, then we can conclude that    *
    * there are only two pieces left, indicating that the only pieces *
    * left are kings, and so the game is a stalemate.                 */
   if (zeroCount == (boardLength * boardLength - 2))
      return true;
      
   /* Now we need to confirm that the player cannot make any   *
    * moves at all. To do so we need to scan across the board, *
    * and for every piece of the proper color, evaluate if     *
    * the piece can move anywhere. As soon as we find a valid  *
    * move, we can be sure that there is a valid move for the  *
    * player to make, so the game is not stalemated.           */
   var rowOuter;
   var colOuter;
   for (rowOuter = 0; rowOuter < boardLength; ++rowOuter) {
      for (colOuter = 0; colOuter < boardLength; ++colOuter) {
         
         /* If the current square isn't a piece of the same color, then *
          * just skip past it.                                          */
         if (color == 'w' && !isWhitePiece(board[rowOuter][colOuter]) ||
             color == 'b' && !isBlackPiece(board[rowOuter][colOuter]))
            continue;
         
         var squareCur = coordsToId(rowOuter, colOuter);
         
         /* Now it's time to loop through every square on the board to *
          * confirm that the piece cannot move anywhere.               */
         var rowInner;
         var colInner;
         for (rowInner = 0; rowInner < boardLength; ++rowInner) {
            for (colInner = 0; colInner < boardLength; ++colInner) {
               
               var squareMov = coordsToId(rowInner, colInner);
               
               /* If the move is valid, then the player has an available *
                * move, so return false.                                 */
               if (checkValid(squareCur, squareMov, board, "stalemate"))
                   return false;
            }
         }
      }
   }
   
   /* At this point, we have confirmed that the king is not in check, *
    * and that no piece of the color in question has any move, so the *
    * game indeed is a stalemate.                                     */
   return true;
}
   
/* Helper function to determine if the game is checkmated. *
 * The color parameter refers to the player whose move it  *
 * is.                                                     */
function isCheckmate(color)
{
   // First confirm that the king is in check. //
   var kingID = findKing(color, board);
   if (!underAttack(color, kingID, board))
       return false;
   
   /* Now we need to confirm that the player cannot make any   *
    * move to remove the king from check. To do so we must     *
    * scan across the board and, for each piece of the king's  *
    * color, confirm that every move it can possibly make will *
    * still leave the king in check.                           */
   var rowOuter;
   var colOuter;
   for (rowOuter = 0; rowOuter < boardLength; ++rowOuter) {
      for (colOuter = 0; colOuter < boardLength; ++colOuter) {
         
         /* If the current square isn't a piece of the same color, then *
          * just skip past it.                                          */
         if (color == 'w' && !isWhitePiece(board[rowOuter][colOuter]) ||
             color == 'b' && !isBlackPiece(board[rowOuter][colOuter]))
            continue;
         
         var squareCur = coordsToId(rowOuter, colOuter);
         
         /* Now it's time to loop through every square on the board to *
          * confirm that the piece cannot move anywhere to remove the  *
          * king from check.                                           */
         var rowInner;
         var colInner;
         for (rowInner = 0; rowInner < boardLength; ++rowInner) {
            for (colInner = 0; colInner < boardLength; ++colInner) {
               
               squareMov = coordsToId(rowInner, colInner);
               
               /* Now we will see if the piece can move to this square.    *
                * Since checkValid() also checks if a player's move will   *
                * result in the player's king being in check, checkValid() *
                * will report that a move is not valid if it leaves the    *
                * king in check. Hence we do not to perform any additional *
                * checking here.                                           */
               if (!checkValid(squareCur, squareMov, board, "checkmate"))
                  continue;
               
               /* Having reached this line, we know we have found a square *
                * that the piece can move to validly, so the player has a  *
                * move that will remove the king from check and the game   *
                * is not over.                                             */
               return false;
            }
         }
      }
   }
   
   /* At this point, we have confirmed that the king is in check, *
    * and that no piece of the color in question can make a move  *
    * to remove the king from check. Thus the player is indeed    *
    * checkmated, so return true.                                 */
   return true;
}               
   
       

/******************************************************************************
 *** COMMENTARY FUNCTIONS **************************** COMMENTARY FUNCTIONS ***
 ******************************************************************************/

// Displays instructions to the screen. //
function updateCommentary(id)
{
   /* In case the id is blank (a situation which arises when  *
    * we are deselecting a piece) or the user does not want   *
    * instructions, then we clear the commentary section      *
    * entirely.                                               */
   if (id == "" || displayInstr == false) {
      document.getElementById("comHead").innerHTML="";
      document.getElementById("comBody").innerHTML="";
   }
   
   else {
      var pieceID = getPieceID(id);
      var piece   = charToPiece(pieceID);
   
      // piece[0] holds the name of the piece. piece[1] holds the bio. //
      document.getElementById("comHead").innerHTML=piece[0];
      document.getElementById("comBody").innerHTML=piece[1];
   }
   
   return;
}

// Changes the displayInstr variable when the checkbox is changed. //
function displayInstructions()
{
   // Update whether the box is checked or unchecked. //
   displayInstr = !displayInstr;
   
   /* Call updateCommentary so that if a piece is selected *
    * right now, the instructions will vanish or appear.   */
   updateCommentary(selection)
   return;
}

// Very simple function which updates the king-in-check status. //
function kingCheck(index)
{
   messages = ["",
               "King is in check!",
               "King cannot be moved into check!"];
   
   kingCell = document.getElementById("kingCheck");
   kingCell.innerHTML = messages[index];
   return;
}

/* postError takes in an integer index representing a   *
 * certain error that has occurred. It posts this error *
 * to the commentary box.                               */
function postError(index)
{
   errors = ["Column index not found.",
             "Piece not found.",
             "Piece not found."];
   
   document.getElementById("comHead").innerHTML="Error!";
   document.getElementById("comBody").innerHTML=errors[index];
   return;
}


/******************************************************************************
 *** CONVERSION FUNCTIONS **************************** CONVERSION FUNCTIONS ***
 ******************************************************************************/

/* A couple simple conversion functions, some of which mainly exist *
 * because apparently JavaScript handles enumerations very poorly.  */

// Takes a letter, returns the corresponding column number. //
function letterToNumber(letter)
{
   var alphabet = ["A", "B", "C", "D",
                   "E", "F", "G", "H",];
   
   for (i = 0; i < alphabet.length; ++i) {
      if (letter == alphabet[i])
         return i;
   }
   
   // If we made it out of the for loop, something went wrong. //
   postError(0);
   return;
}

/* Takes a character, returns the name of the corresponding piece, *
 * along with instructional information.                           */
function charToPiece(char)
{
   char = char.toLowerCase();
   var chars = ["i", "l", "k",
                "j", "m", "n"];
   
   var pieces = ["Pawn", "Rook", "Knight",
                 "Bishop", "Queen", "King"];
   
   // Instructional information about each piece. //
   var pieceBios = ["Can move one space forward, or two if the pawn has "
                    +"not already been moved. The pawn attacks by moving "
                    +"one space diagonally forward. If a pawn reaches the " 
                    +"opponent's last row, the pawn becomes a queen.",
                    "Can move up, down, left or right as many spaces as "
                    +"possible.",
                    "Can move in an 'L' fashion, either by going two spaces "
                    +"up or down followed by one space right or left, or by "
                    +"going two spaces right or left followed by one space "
                    +"up or down.",
                    "Can move diagonally in any direction as many spaces "
                    +"as possible.",
                    "Can move in any direction (up, down, left, right or "
                    +"diagonally) as many spaces as possible.",
                    "Can move one space in any direction (up, down, left, "
                    +"right or diagonally). If the king is ever in danger, "
                    +"he <b>must</b> be moved. If it is impossible to "
                    +"remove the king from danger, the game is over."];
   
   for (i = 0; i < chars.length; ++i)
      if (char == chars[i])
         return [pieces[i], pieceBios[i]];
   
   // If we made it out of the for loop, something went wrong. //
   postError(1);
   return;
}

/* Easy conversion between column number and the *
 * appropriate letter.                           */
function numberToLetter(number)
{
   var letters = ["A", "B", "C", "D",
                  "E", "F", "G", "H"];
   
   return letters[number];
}

/* Useful conversion from a square's id to *
 * its coordinates on the board.           */
function idToCoords(id)
{
   var col = letterToNumber(id[0]);
   var row = 9 - id[1] - 1;
   
   return [row, col];
}

// Another useful conversion that goes the opposite way. //
function coordsToId(row, col)
{
   var colLetter = numberToLetter(col);
   var rowNumber = 9 - row - 1;
   var id        = colLetter + rowNumber;
   
   return id;
}
             
// Returns the character located in a given square. //
function getPieceID(id)
{
   var coords = idToCoords(id);
   return board[coords[0]][coords[1]];
}
   
/* findKing takes a player's color and finds that player's      *
 * king. This is useful for learning if a player is in check,   *
 * and is used almost exclusively in tandem with underAttack(). *
 * Castling also makes use of this function briefly as well.    */
function findKing(color, chessBoard)
{
   var row;
   var col;
   var square;
   for (row = 0; row < boardLength; ++row) {
      for (col = 0; col < boardLength; ++col) {
         
         // w represents white, and n represents white's king. //
         if(color == 'w' && chessBoard[row][col] == 'n')
            square = coordsToId(row, col);
         
         // b represents black, and N represents black's king. //
         else if(color == 'b' && chessBoard[row][col] == 'N')
            square = coordsToId(row, col);
      }
   }
   
   /* We've found the square, so return. We do no error   *
    * checking here because if there's no king on the     *
    * board, presumably the programmer is toying with the *
    * code, as it is an impossibility in chess for a      *
    * player to not have a king on the board.             */
   return square;
}

/* On several occasions I need to copy the board. Because  *
 * JavaScript does not support deep copying, we are forced *
 * to copy the board manually, a task which is better left *
 * to this helper function.                                */
function copyBoard()
{
   // Default board. //
   var boardCopy = [["0", "0", "0", "0", "0", "0", "0", "0"],
                    ["0", "0", "0", "0", "0", "0", "0", "0"],
                    ["0", "0", "0", "0", "0", "0", "0", "0"],
                    ["0", "0", "0", "0", "0", "0", "0", "0"],
                    ["0", "0", "0", "0", "0", "0", "0", "0"],
                    ["0", "0", "0", "0", "0", "0", "0", "0"],
                    ["0", "0", "0", "0", "0", "0", "0", "0"],
                    ["0", "0", "0", "0", "0", "0", "0", "0"]];
   
   // Now actually copy it. //
   var row;
   var col;
   for (row = 0; row < boardLength; ++row)
      for (col = 0; col < boardLength; ++col)
         boardCopy[row][col] = board[row][col];
   
   return boardCopy;
}

/******************************************************************************
 *** MOVE GUIDE FUNCTIONS **************************** MOVE GUIDE FUNCTIONS ***
 ******************************************************************************/

/* NOTE: All functions below this point are not necessary for the     *
 * primary functioning of the chess game. They add quality to the     *
 * experience, and add extra functionality, but they are not required *
 * for gameplay.                                                      */

/* Simple function which is called when the user   *
 * changes the move guide setting.                 */
function moveGuide(piece)
{
   // Update whether the box is checked or unchecked. //
   displayMoveGuide = !displayMoveGuide;
   
   /* Call updateMoveGuide so that if a piece is selected *
    * right now, the guide will vanish or appear          */
   updateMoveGuide()
   return;
}

/* updateMoveGuide is called by choose(), which passes it an id *
 * of a square that the player has clicked on. updateMoveGuide  *
 * then has the responsibility of updating the on-board         *
 * highlighted move guide accordingly. Note that there are two  *
 * branches of execution: If the selection is blank, then       *
 * updateMoveGuide needs to ensure that all the squares are     *
 * unlighted. If selection isn't blank, it needs to highlight   *
 * the squares properly.                                        */
function updateMoveGuide()
{
   // Three variables to hold temporary info while we loop. //
   var colLetter;
   var rowNumber;
   var id;
   
   var row;
   var col;   
   for (row = 0; row < boardLength; ++row) {
      for (col = 0; col < boardLength; ++col) {
         
         /* Before we can do anything else, we need to *
          * find the given square's id.                */
         id = coordsToId(row, col);
         
         /* We then will check to see if the selection is empty,      *
          * in which case we just reset each square's class properly. *
          * The !displayMoveGuide is present in case the user has        *
          * a piece selected and then turns off the move guide. In    *
          * this situation, moveGuide() calls updateMoveGuide,        *
          * expecting it to shut off the highlights, which is exactly *
          * what the following code does.                             */
         if (selection == "" || !displayMoveGuide) {
            if (isWhiteSquare(id))
               document.getElementById(id).setAttribute('class',
                                                        'whiteSquare');
            else
               document.getElementById(id).setAttribute('class',
                                                        'blackSquare');
         }
         
         /* If there is a selection then we evaluate whether each   *
          * square is a valid move. However, we do not want to make *
          * this check if the current square is also the square of  *
          * the selected piece!                                     */
         else if (!((row == idToCoords(selection)[0]) &&
                    (col == idToCoords(selection)[1])))  {
                        
            // If it turns out the move is valid, then highlight the square. //
            if (checkValid(selection, id, board, "moveGuide")) {
               if (isWhiteSquare(id))
                  document.getElementById(id).setAttribute('class',
                                                           'moveGuideWhite');
               else
                  document.getElementById(id).setAttribute('class',
                                                           'moveGuideBlack');
            }
            
            else {
               /* If the player selects a different piece, we         *
                * need to update the guide, and that means erasing    *
                * the highlights from the previously selected piece's *
                * guide.                                              */
               if (isWhiteSquare(id))
                  document.getElementById(id).setAttribute('class',
                                                           'whiteSquare');
               else
                  document.getElementById(id).setAttribute('class',
                                                           'blackSquare');
            }
         }
      }
   }
   
   // Done updating. //
   return;
}
         
/* Function that confirms whether or not a given square *
 * is a white square.                                   */
function isWhiteSquare(id)
{
   var square = document.getElementById(id);
   var color  = square.getAttribute('class');
   
   if (color == 'whiteSquare' ||
       color == 'moveGuideWhite')
      return true;
   else
      return false;
}


/******************************************************************************
 *** UNDO FUNCTIONS **************************************** UNDO FUNCTIONS ***
 ******************************************************************************/

/* undo rewinds the board one step. To do so it relies on     *
 * the variable previousBoards, an array holding the previous *
 * states of the board. Undo calls render() on the last       *
 * element of this array.                                     */
function undo()
{
   // If the array of previous boards is empty, just return. //
   if (previousBoards.length == 0)
      return;
   
   /* Otherwise, deselect the current piece, find out how many   *
    * boards we have in the array right now, and access the last *
    * of them. Call render on it.                                */
   if (selection != "")
      unChoose("undo");
   
   var boardCount = previousBoards.length;
   var newBoard   = previousBoards[boardCount - 1][0];
   render(newBoard, moveNo - 1);
   
   /* We also need to update the global variable 'board' to reflect *
    * the undo, otherwise once the players resume the game the      *
    * board will immediately reset itself to the position it was in *
    * when the player pressed undo.                                 */
   var row;
   var col;
   for (row = 0; row < boardLength; ++row)
      for (col = 0; col < boardLength; ++col)
           board[row][col] = newBoard[row][col];
   
   /* If a piece was captured on this turn,   *
    * we should remove it from the graveyard. */
   if (previousBoards[boardCount - 1][1][0] != "0")
      updateGraveyard(previousBoards[boardCount - 1][1][0], "out");
   
   // Reset the various variables stored in previousBoards. //
   hasMovedWhiteKing  = previousBoards[boardCount - 1][1][1];
   hasMovedBlackKing  = previousBoards[boardCount - 1][1][2];
   hasMovedWhiteRookL = previousBoards[boardCount - 1][1][3];
   hasMovedWhiteRookR = previousBoards[boardCount - 1][1][4];
   hasMovedBlackRookL = previousBoards[boardCount - 1][1][5];
   hasMovedBlackRookL = previousBoards[boardCount - 1][1][6];
      
   /* Once it has rendered, pop it off the array and *
    * decrement the move number.                     */
   previousBoards.pop();
   moveNo -= 1;
   
   // Remove the notation for the previous move. //
   removeNotationCell(moveNo);
   
   return;
}
   
/* There is a small amount of managerial work involved in *
 * updating the queue of previous boards. We need to      *
 * pop off the oldest board if the queue is already       *
 * holding the maximum amount of past boards, and         *
 * we obviously need to add on the new board as well.     *
 * updateUndo handles these tasks.                        */
function updateUndo(rowMov, colMov)
{
   
   // Create a new board so that we can push it onto previousBoards. //
   var tempBoard = copyBoard();
   
   /* Find the piece we may have captured so that we can        *
    * push it onto previousBoards along with the current board. */
   var pieceMov = board[rowMov][colMov];
   
   /* A bunch of relevant information about this state of the board. *
    * All of it should be cached for later use.                      */
   var relevantVariables = [pieceMov, hasMovedWhiteKing, hasMovedBlackKing,
                            hasMovedWhiteRookL, hasMovedWhiteRookR,
                            hasMovedBlackRookL, hasMovedBlackRookL];
   
   // Add on the new board, and we're finished. //
   previousBoards.push([tempBoard, relevantVariables]);
   return;
}

/* undoX merely rewinds the game x amount of times by calling   *
 * undo() X times. This is necessary for allowing the user to   *
 * undo by clicking on the notation entires. Thid id represents *
 * the id of the notation entry that was clicked on.            */
function undoX(id)
{
   /* The move number attached to the id accounts only for the    *
    * the number of back-and-forth moves. The number of times     *
    * we want to undo, however, is the number of moves total      *
    * between the current move and the one selected. A conversion *
    * is in order.                                                */
   var idMove     = parseInt(id.substring(0, id.length - 1));
   var actualMove = idMove * 2;
   if (id.substring(id.length - 1) == 'w')
      --actualMove;
   
   // Now we call undo the proper number of times. //
   var moveDif = moveNo - actualMove;
   var index;
   for (index = 0; index < moveDif; ++index)
      undo();
   
   return;
}


/******************************************************************************
 *** NOTATION FUNCTIONS ******************************** NOTATION FUNCTIONS ***
 ******************************************************************************/

/* addNotation accepts the square id's of two squares: that of the currently *
 * selected square and that of the square we are trying to make a move to.   *
 * It adds the notation to the board. This code is somewhat long and         *
 * conditional, but it reflects the rules of chess which I do not wish to    *
 * change.                                                                   */
function addNotation(pieceCur, pieceMov, rowMov, colMov, rowCur, colCur)
{
   var moveWrapperOpen  = "<a style='padding-left: 1px; padding-top: 4px;' class='notary'>";
   var moveWrapperClose = "</a>";
   var moveNotation     = "";
   var notationMoveNum  = Math.ceil((moveNo - 1) / 2);
   var color;
   
   // Set the color. //
   if (isWhitePiece(pieceCur)) {
      color      = 'w';
      otherColor = 'b';
   }
   
   else {
      color      = 'b';
      otherColor = 'w';
   }
   
   /* If it's white's turn, we start a new row and add the   *
    * move number onto the line. Recall moveNo was augmented *
    * within updateBoard(), so we must decrement it for the  *
    * turn test.                                             */
   if ((moveNo - 1) % 2 == 1) {
      addNotationRow(notationMoveNum);
      document.getElementById(notationMoveNum+"num").innerHTML =
         notationMoveNum+".";
   }
      
   /* Grab the location the piece is moving to.          *
    * This info will be required for (almost) any move.  */
   var square = coordsToId(rowMov, colMov).toLowerCase();
   
   var pieceFont = "<font style='font-family: \"Chess Alpha 2\";" +
                   "font-size: 25px;'>";
   /* Add the piece to the notation. We only do this if the piece *
    * is not a pawn.                                              */
   if (pieceCur != "i" && pieceCur != "I")
      moveNotation += pieceFont + pieceCur + "</font>";
   
   // If a piece is captured, insert an 'x'. //
   if (pieceMov != "0")
      moveNotation += "x";
   
   // Tack on the square that was moved to. //
   moveNotation += square;
   
   // If the pawn was promoted we add a queen to the end. //
   if (pieceCur == 'i' && rowMov == 0)
      moveNotation += pieceFont + "m</font>";
   else if (pieceCur == 'I' && rowMov == 7)
      moveNotation += pieceFont + "M</font>";
   
   // If the move was a castle, then we completely reset the notation. //
   if (pieceCur == 'n' || pieceCur == 'N') {
      if (colMov - colCur == 2)        // Kingside castle. //
         moveNotation = "0-0";
      else if (colCur - colMov == 2)   // Queenside castle. //
         moveNotation = "0-0-0";
   }
   
   /* Find out if the other player is now checkmated. I declare    *
    * this as a variable as I will use it twice (once to determine *
    * if the other player is checked but not checkmated and once   *
    * to determine if they are checkmated and the game is over.)   */
   var checkmated = isCheckmate(otherColor);
      
   // If the player is checkmated, add a "#". //
   if (checkmated)
      moveNotation += "#";
   
   // Otherwise, if the player is just in check, add a "+". //
   else {
      // Fine out if the other player is in check. //
      var kingID = findKing(otherColor, board);
      if (underAttack(otherColor, kingID, board))
         moveNotation += "+";
   }
   
   // Finally, add the notation to the screen, and we're done. //
   var whatToWrite = moveWrapperOpen + moveNotation + moveWrapperClose;
   document.getElementById(notationMoveNum + color).innerHTML = whatToWrite;
   
   return;
}

// Adds a row to the notation box. //
function addNotationRow(move)
{
   // If this is the first move, add the undoX header. //
   if (moveNo == 2)
      document.getElementById("undoXHeader").innerHTML="Click to undo.";
   
   // Grab the table location. //
   var table = document.getElementById("notationTable");
   
   // Create the new table elements. //
   var newRow = table.insertRow(1);
   var numberCell = newRow.insertCell(0);
   var whiteCell  = newRow.insertCell(1);
   var blackCell  = newRow.insertCell(2);

   // Add on the id's to the cells. //
   numberCell.setAttribute('id', move+'num');
   whiteCell.setAttribute('id',  move+'w');
   blackCell.setAttribute('id',  move+'b');
   
   // Give the new cells onClick() functionality. //
   whiteCell.setAttribute('onClick', 'undoX("'+move+'w")');
   blackCell.setAttribute('onClick', 'undoX("'+move+'b")');
   
   // And finally set the new cells' classes. //
   numberCell.setAttribute('class', 'notationNum');
   whiteCell.setAttribute('class',  'notationMove');
   blackCell.setAttribute('class',  'notationMove');
   
   // Give the new cells some content, so that they are allotted space. //
   numberCell.innerHTML = "&nbsp;";
   whiteCell.innerHTML  = "&nbsp;";
   blackCell.innerHTML  = "&nbsp;";
   
   return;
}

// Removes a notation row. This will be needed by undo(). //
function removeNotationCell(move)
{
   // Remove the undoX header if this is the first move. //
   if (move == 1)
      document.getElementById("undoXHeader").innerHTML = "";
   
   /* We augment move because move is necessarily decremented *
    * by undo() before the call to removeNotationCell.        */
   ++move;
   
   /* If we are undoing a black move, we want to remove *
    * the cell content instead of deleting the row.     */
   var blackCell = document.getElementById(Math.ceil((move - 1) / 2) + "b");
   if (move % 2 == 1)
      blackCell.innerHTML = " ";
   
   // Otherwise it's a white move and we want to delete the entire row. //
   else {
      var row = blackCell.parentNode.rowIndex;
      document.getElementById("notationTable").deleteRow(row);
   }
   
   return;
}
   

/******************************************************************************
 *** AUXILIARY FUNCTIONS ****************************** AUXILIARY FUNCTIONS ***
 ******************************************************************************/

/* Function to allow the user to check or uncheck an option        *
 * by clicking on the text next to the box and not the box itself. */
function changeBox(checkBox)
{
   var box = eval(checkBox);
   box.checked = !box.checked;
   return;
}

/* Function which unchecks all the options (called only *
 * when the page loads).                                */
function uncheckOptions()
{
   var options = document.getElementsByTagName('input');
   
   for (var i = 0; i < options.length; ++i) {
      if (options[i].getAttribute('type') == 'checkbox')
         options[i].checked = false;
   }
   
   return;
}
