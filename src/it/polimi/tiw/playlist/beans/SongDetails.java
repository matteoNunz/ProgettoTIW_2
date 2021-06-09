package it.polimi.tiw.playlist.beans;

public class SongDetails{
	private int id;
	private String songTitle;
	private String albumTitle;
	private String singer;
	private String kindOf;
	private String songFile;//where is the music file
	private String imgFile;
	private int publicationYear;

	
	/**
	 * 
	 * @return the id of the song
	 */
	public int getId() {
		return id;
	}
	
	/**
	 * 
	 * @return the song title
	 */
	public String getSongTitle() {
		return songTitle;
	}
	
	/**
	 * 
	 * @return the title of the album that contains the song
	 */
	public String getAlbumTitle() {
		return albumTitle;
	}
	
	/**
	 * 
	 * @return the singer of the song
	 */
	public String getSinger() {
		return singer;
	}
	
	/**
	 * 
	 * @return the kind of song
	 */
	public String getKindOf() {
		return kindOf;
	}
	
	/**
	 * 
	 * @return the path of the music file
	 */
	public String getSongFile() {
		return songFile;
	}
	
	/**
	 * 
	 * @return the path of the image
	 */
	public String getImgFile() {
		return imgFile;
	}
	
	/**
	 * 
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
	 * @param newSongTitle is the new title of the song
	 */
	public void setSongTitle(String newSongTitle) {
		this.songTitle = newSongTitle;
	}
	
	/**
	 * Set the title of the album that contains the song
	 * @param newAlbumTitle
	 */
	public void setAlbumTitle(String newAlbumTitle) {
		this.albumTitle = newAlbumTitle;
	}
	
	
	/**
	 * Set the name of singer
	 * @param newSinger is the new name
	 */
	public void setSinger(String newSinger) {
		this.singer = newSinger;
	}
	
	/**
	 * Set the kind of the song
	 * @param newKindOf is the new type
	 */
	public void setKindOf(String newKindOf) {
		this.kindOf = newKindOf;
	}
	
	/**
	 * Set the position of the file
	 * @param newFile is the position where the file is stored
	 */
	public void setFile(String newFile) {
		this.songFile = newFile;
	}
	
	/**
	 * Set the position of the image
	 * @param newFile is the position where the song is stored
	 */
	public void setImgFile(String newFile) {
		this.imgFile = newFile;
	}
	
	/**
	 * Set the publication year
	 * @param date is the year 
	 */
	public void setPublicationYear(int date) {
		this.publicationYear = date;
	}

}


