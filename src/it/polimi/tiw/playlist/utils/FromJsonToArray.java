package it.polimi.tiw.playlist.utils;

import java.util.ArrayList;

public class FromJsonToArray {
	
	/**
	 * Static method that read a jSon string of number and convert it into an arrayList of integer
	 * @param jSon is the String to be converted
	 * @return an arrayList containing the conversion of the jSon
	 */
	public static ArrayList<Integer> fromJsonToArrayList(String jSon){
		
		ArrayList<Integer> sortedArray = new ArrayList<Integer>();
		int num = 0;
		boolean wasNumber = false;
		boolean invalidNumber = false;
		char charLetto = ' ';
		
		//Convert the jSon into an array of integer
		for(int i = 1 ; i < jSon.length() ; i++) {
			//System.out.println("Processing character " + jSon.charAt(i));
			//92 is the "\" character
			if(jSon.charAt(i) == '[' || jSon.charAt(i) == ']' || jSon.charAt(i) == 92 || jSon.charAt(i) == ',' 
									 || jSon.charAt(i) == '"' || jSon.charAt(i) == ' ') {
				if(invalidNumber) {
					System.out.println("Invalid number found");
					//Don't add the number in the array and reset the variables
					num = 0;
					wasNumber = false;
					invalidNumber = false;
				}
				else if(wasNumber) {
					System.out.println("Added number: " + num);
					sortedArray.add(num);
					num = 0;
					wasNumber = false;
				}
				continue;
			}
			charLetto = jSon.charAt(i);
			//Check if the char read is a number
			if(charLetto < 48 && charLetto > 57) {
				invalidNumber = true;
			}
			num = num * 10 + (charLetto - 48);
			wasNumber = true;
		}
		return sortedArray;
	}
}
