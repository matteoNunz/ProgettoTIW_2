package it.polimi.tiw.playlist.beans;

import java.sql.Date;

public class Playlist {
	private int id;
	private String title;
	private Date creationDate;
	
	/**
	 * 
	 * @return the title of the PlayList
	 */
	public String getTitle() {
		return title;
	}
	
	/**
	 * 
	 * @return the id of the playList
	 */
	public int getId() {
		return id;
	}
	
	/**
	 * 
	 * @return the creation date of the PlayList
	 */
	public Date getCreationDate() {
		return creationDate;
	}
	
	/**
	 * Set the title
	 * @param newTitle is the new title
	 */
	public void setTitle(String title) {
		this.title = title;
	}
	
	/**
	 * Set the id
	 * @param id
	 */
	public void setId(int id) {
		this.id = id;
	}
	
	/**
	 * Set the creation date
	 * @param date
	 */
	public void setCreationDate(Date date) {
		this.creationDate = date;
	}
}





