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

@WebServlet("/GoToPlayListPage")
@MultipartConfig
public class GoToPlaylistPage extends HttpServlet{
	
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
		String section = request.getParameter("section");//Which songs need to be shown
		String error = "";
		String error1 = "";
		int id = -1;
		int block = 0;
		
		System.out.println("Getting the song in playlist " + playlistId);
		
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
			response.getWriter().println("Bad request");
			return;
		}
		
		//The user created this playList
		
		//Take the error in case of forward from AddSong
		if(request.getAttribute("error") != null) {
			error += (String) request.getAttribute("error");
		}
		//Take the error in case of forward from GoToSongPage
		else if(request.getAttribute("error2") != null) {
			error1 += (String) request.getAttribute("error2");
		}
		
		//to take songs in and not in the specified playList
		SongDAO sDao = new SongDAO(connection);
		
		//To take the title of the playList
		//PlaylistDAO pDao = new PlaylistDAO(connection);
		
		//Take the titles and the image paths
		try {
			
			ArrayList<SongDetails> songsInPlaylist = sDao.getSongTitleAndImg(id);
			//Send this with an other servlet
			//ArrayList<SongDetails> songsNotInPlaylist = sDao.getSongsNotInPlaylist(id , user.getId());
			//String title = pDao.findPlayListTitleById(id);
			
			/*Done in the view
			boolean next = false;
			
			if(block * 5 + 5 > songsInPlaylist.size()) {
				block = (songsInPlaylist.size() / 5);
			}
			if((block * 5 + 5) < songsInPlaylist.size()) {
				next = true;
			}
			
			//Save only the songs in the current block (max 5 songs)
			ArrayList<SongDetails> songs = new ArrayList<SongDetails>();
			
			if(songsInPlaylist.size() > 0) {
				for(int i = (block * 5) ; i < (block * 5 + 5) && i < songsInPlaylist.size(); i++){
					SongDetails song = songsInPlaylist.get(i);
					songs.add(song);
				}	
			}*/
			
			/*Now the view has the playlist id 
			Playlist p = new Playlist();
			p.setId(id);
			p.setTitle(title);*/
			
			//Send all the song of the playList
			JSONArray jArray = new JSONArray();
			JSONObject jSonObject = new JSONObject();
			
			
			for(SongDetails song : songsInPlaylist) {
				jSonObject.put("songId", song.getId());
				jSonObject.put("songTitle" , song.getSongTitle());
				jSonObject.put("fileName" , song.getImgFile());
				
				jArray.put(jSonObject);
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
