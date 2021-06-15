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

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import it.polimi.tiw.playlist.beans.SongDetails;
import it.polimi.tiw.playlist.beans.User;
import it.polimi.tiw.playlist.dao.PlaylistDAO;
import it.polimi.tiw.playlist.dao.SongDAO;
import it.polimi.tiw.playlist.utils.ConnectionHandler;

@WebServlet("/GetSongsNotInPlaylist")
@MultipartConfig
public class GetSongsNotInPlaylist extends HttpServlet{
	
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
		String error = "";
		String error1 = "";
		int id = -1;
		
		System.out.println("Getting songs not in playlist " + playlistId);
		
		HttpSession s = request.getSession();
		
		//Take the user
	    User user = (User) s.getAttribute("user");
	    
		//Check if playlistId is valid
		if(playlistId == null || playlistId.isEmpty())
			error += "Playlist not defined;";
		
		//Check the follow only if the id is valid
		if(error.equals("")) {
			//Create the DAO to check if the playList id belongs to the user 
			PlaylistDAO pDao = new PlaylistDAO(connection);
			
			try {
				//Check if the playlistId is a number
				id = Integer.parseInt(playlistId);

				//Check if the player can access at this playList --> Check if the playList exists
				if(!pDao.findPlayListById(id, user.getId())) {
						error += "PlayList doesn't exist";
				}
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
		
		//To take the title of the playList
		//PlaylistDAO pDao = new PlaylistDAO(connection);
		
		//Take the titles and the image paths
		try {
			
			ArrayList<SongDetails> songsNotInPlaylist = sDao.getSongsNotInPlaylist(id , user.getId());
			
			int numberOfSongs = songsNotInPlaylist.size();
			
			System.out.println("Number of songs is " +  numberOfSongs);
			
			//Send all the song of the playList
			/*JSONArray jArray = new JSONArray();
			JSONObject jSonObject;
			
			
			for(SongDetails song : songsInPlaylist) {
				System.out.println("Title: " + song.getSongTitle());
				
				//Here to reset the attribute for each song
				jSonObject = new JSONObject();
				
				jSonObject.put("songId", song.getId());
				jSonObject.put("songTitle" , song.getSongTitle());
				jSonObject.put("fileName" , song.getImgFile());
				
				jArray.put(jSonObject);
			}
			
			System.out.println("Prining jArray: ");
			System.out.println(jArray.toString());*/
			
			//Create the jSon with the answer
			Gson gSon = new GsonBuilder().create();
			String jSon = gSon.toJson(songsNotInPlaylist);
			
			System.out.println("Printing the jSon with all the song not in the playlist");
			System.out.println(jSon.toString());
			
			response.setStatus(HttpServletResponse.SC_OK);//Code 200
			response.setContentType("application/json");
			response.setCharacterEncoding("UTF-8");
			response.getWriter().println(jSon);
			
		}catch(SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);//Code 500
			response.getWriter().println("Internal server error, retry later");
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

