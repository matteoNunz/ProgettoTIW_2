package it.polimi.tiw.playlist.utils;

import java.util.ArrayList;

public class FromJsonToArray {
	
	public static ArrayList<Integer> fromJsonToArrayList(String jSon){
		
		ArrayList<Integer> sortedArray = new ArrayList<Integer>();
		int num = 0;
		boolean wasNumber = false;
		
		//Convert the jSon into an array of integer
		for(int i = 1 ; i < jSon.length() ; i++) {
			System.out.println("Processing character " + jSon.charAt(i));
			//92 is the "\" character
			if(jSon.charAt(i) == '[' || jSon.charAt(i) == ']' || jSon.charAt(i) == 92 || jSon.charAt(i) == ',' || jSon.charAt(i) == '"' || jSon.charAt(i) == ' ') {
				if(wasNumber) {
					System.out.println("Added number: " + num);
					sortedArray.add(num);
					num = 0;
					wasNumber = false;
				}
				continue;
			}
			num = num * 10 + (jSon.charAt(i) - 48);
			wasNumber = true;
		}
		return sortedArray;
	}
}
