package it.polimi.tiw.playlist.beans;

public class SongDetails{
	private int id;
	private String songTitle;
	private String albumTitle;
	private String singer;
	private String kindOf;
	private String songFile;//The name of the song file stored
	private String imgFile;//The name of the image file stored
	private int publicationYear;

	
	/**
	 * @return the id of the song
	 */
	public int getId() {
		return id;
	}
	
	/**
	 * @return the song title
	 */
	public String getSongTitle() {
		return songTitle;
	}
	
	/**
	 * @return the title of the album that contains the song
	 */
	public String getAlbumTitle() {
		return albumTitle;
	}
	
	/**
	 * @return the singer of the song
	 */
	public String getSinger() {
		return singer;
	}
	
	/**
	 * @return the kind of song
	 */
	public String getKindOf() {
		return kindOf;
	}
	
	/**
	 * @return the name of the music file
	 */
	public String getSongFile() {
		return songFile;
	}
	
	/** 
	 * @return the name of the image file
	 */
	public String getImgFile() {
		return imgFile;
	}
	
	/**
	 * @return the publication year of the album that contains the song
	 */
	public int getPublicationYear() {
		return publicationYear;
	}
	
	/**
	 * Set the song id
	 * @param id is the unique id of the song
	 */
	public void setId(int id) {
		this.id = id;
	}
	
	/**
	 * Set the SongTitle
	 * @param songTitle is the title of the song
	 */
	public void setSongTitle(String songTitle) {
		this.songTitle = songTitle;
	}
	
	/**
	 * Set the title of the album that contains the song
	 * @param albumTitle is the album title
	 */
	public void setAlbumTitle(String albumTitle) {
		this.albumTitle = albumTitle;
	}
	
	
	/**
	 * Set the name of singer
	 * @param singer is the name of the singer
	 */
	public void setSinger(String singer) {
		this.singer = singer;
	}
	
	/**
	 * Set the kind of the song
	 * @param newKindOf is the new type
	 */
	public void setKindOf(String kindOf) {
		this.kindOf = kindOf;
	}
	
	/**
	 * Set the name of the song file
	 * @param songFile is the name of the file stored
	 */
	public void setFile(String songFile) {
		this.songFile = songFile;
	}
	
	/**
	 * Set the name of the image
	 * @param imgFile is the name of the song is stored
	 */
	public void setImgFile(String imgFile) {
		this.imgFile = imgFile;
	}
	
	/**
	 * Set the publication year
	 * @param date is the year 
	 */
	public void setPublicationYear(int date) {
		this.publicationYear = date;
	}

}


