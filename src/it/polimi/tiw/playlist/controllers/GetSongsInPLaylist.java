package it.polimi.tiw.playlist.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.UnavailableException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import it.polimi.tiw.playlist.beans.SongDetails;
import it.polimi.tiw.playlist.beans.User;
import it.polimi.tiw.playlist.dao.PlaylistDAO;
import it.polimi.tiw.playlist.dao.SongDAO;
import it.polimi.tiw.playlist.utils.ConnectionHandler;
import it.polimi.tiw.playlist.utils.GetEncoding;

@WebServlet("/GetSongsInPlaylist")
@MultipartConfig
public class GetSongsInPLaylist extends HttpServlet{
	
	private static final long serialVersionUID = 1L;
	private Connection connection;

	public void init() {
		ServletContext context = getServletContext();
		
		try {
			connection = ConnectionHandler.getConnection(context);
		} catch (UnavailableException e) {
			e.printStackTrace();
		}
	}
	
	public void doGet(HttpServletRequest request , HttpServletResponse response)throws ServletException,IOException{
		//Take the playList id
		String playlistId = request.getParameter("playlistId");
		String section = request.getParameter("section");
		String error = "";
		int id = -1;
		int block = 0;
		
		HttpSession s = request.getSession();
		
		//Take the user
	    User user = (User) s.getAttribute("user");
	    
		//Check if playlistId is valid
		if(playlistId == null || playlistId.isEmpty())
			error += "Playlist not defined;";
		
		//If section is null or empty set it to the default value
		if(section == null || section.isEmpty()) {
			section = "0";
		}
		
		//Check the follow only if the id is valid
		if(error.equals("")) {
			//Create the DAO to check if the playList id belongs to the user 
			PlaylistDAO pDao = new PlaylistDAO(connection);
			
			try {
				//Check if the playlistId is a number
				id = Integer.parseInt(playlistId);
				//Check if section is a number
				block = Integer.parseInt(section);
				//Check if the player can access at this playList --> Check if the playList exists
				if(!pDao.findPlayListById(id, user.getId())) {
						error += "PlayList doesn't exist";
				}
				if(block < 0)
					block = 0;
			}catch(NumberFormatException e) {
				error += "Playlist e/o section not defined;";
			}catch(SQLException e) {
				error += "Impossible comunicate with the data base;";
			}
		}	
		
		if(!error.equals("")){
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);//Code 400
			response.getWriter().println(error);
			return;
		}
		
		//The user created this playList
		
		//to take songs in and not in the specified playList
		SongDAO sDao = new SongDAO(connection);
		
		//To take a specific ordering for songs (if present)
		PlaylistDAO pDao = new PlaylistDAO(connection);
		
		//Take the titles and the image paths
		try {
			
			ArrayList<SongDetails> songsInPlaylist = sDao.getSongTitleAndImg(id);
			ArrayList<Integer> sorting = pDao.getSorting(id);
			
			//Send all the song of the playList
			JSONArray jArray = new JSONArray();
			JSONObject jSonObject;

			if(sorting != null) {
				//Reorder the songs
				for(Integer i : sorting) {
					for(SongDetails song : songsInPlaylist) {
						if(song.getId() == i) {
							
							//Here to reset the attribute for each song
							jSonObject = new JSONObject();
							
							jSonObject.put("songId", song.getId());
							jSonObject.put("songTitle" , song.getSongTitle());
							jSonObject.put("fileName" , song.getImgFile());
							try {
								jSonObject.put("base64String" , GetEncoding.getImageEncoding(song.getImgFile() , 
										getServletContext() , connection , user));
							} catch(IOException e) {
								jSonObject.put("base64String" , "");
							}
							
							jArray.put(jSonObject);
							
							//Remove the song read
							songsInPlaylist.remove(song);
							break;
						}
					}
				}
				//If there are no sorted songs show them as last
				if(songsInPlaylist.size() > 0) {
					for(SongDetails song : songsInPlaylist) {
						
						jSonObject = new JSONObject();
						
						jSonObject.put("songId", song.getId());
						jSonObject.put("songTitle" , song.getSongTitle());
						jSonObject.put("fileName" , song.getImgFile());
						try {
							jSonObject.put("base64String" , GetEncoding.getImageEncoding(song.getImgFile() , 
									getServletContext() , connection , user));
						} catch(IOException e) {
							jSonObject.put("base64String" , "");
						}
						
						jArray.put(jSonObject);
					}
				}
			}
			else {
				//Songs with standard ordering
				for(SongDetails song : songsInPlaylist) {
					System.out.println("Title: " + song.getSongTitle());
					
					//Here to reset the attribute for each song
					jSonObject = new JSONObject();
					
					jSonObject.put("songId", song.getId());
					jSonObject.put("songTitle" , song.getSongTitle());
					jSonObject.put("fileName" , song.getImgFile());
					
					try {
						jSonObject.put("base64String" , GetEncoding.getImageEncoding(song.getImgFile() , 
								getServletContext() , connection , user));
					} catch(IOException e) {
						jSonObject.put("base64String" , "");
					}
					
					jArray.put(jSonObject);
				}
			}
			
			response.setStatus(HttpServletResponse.SC_OK);//Code 200
			response.setContentType("application/json");
			response.setCharacterEncoding("UTF-8");
			response.getWriter().println(jArray);
			
		}catch(SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);//Code 500
			response.getWriter().println("Internal server error, retry later");
		}catch(JSONException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);//Code 500
			response.getWriter().println("Internal server error, error during the creation of the response");
		}
	}

	public void destroy() {
		try {
			ConnectionHandler.closeConnection(connection);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
}
