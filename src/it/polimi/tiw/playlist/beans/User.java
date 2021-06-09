package it.polimi.tiw.playlist.beans;

public class User {
	private int id;
	private String userName;
	private String password;
	
	public User(String userName , String password , int id) {
		this.userName = userName;
		this.password = password;
		this.id = id;
	}
	
	public User(String userName , String password) {
		this.userName = userName;
		this.password = password;
	}
	
	/**
	 * 
	 * @return the userName 
	 */
	public String getUserName() {
		return userName;
	}
	
	/**
	 * 
	 * @return the password of the user
	 */
	public String getPassword() {
		return password;
	}
	
	/**
	 * 
	 * @return the user's id
	 */
	public int getId() {
		return id;
	}
	
	/**
	 * Change the userName of the user
	 * @param newUserName is the new userName
	 */
	public void setUserName(String newUserName) {
		this.userName = newUserName;
	}
	
	/**
	 * Change the password of the user
	 * @param newPassword is the new password
	 */
	public void setPassword(String newPassword) {
		this.password = newPassword;
	}
	
	/**
	 * Change the id of the user
	 * @param id is the new id
	 */
	public void setId(int id) {
		this.id = id;
	}
	
}
