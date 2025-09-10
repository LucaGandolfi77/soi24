package it.unipr.soi23.game_web_server.service.impl;

import it.unipr.soi23.game_web_server.broker.GameDataBroker;
import it.unipr.soi23.game_web_server.broker.PlayerBroker;
import it.unipr.soi23.game_web_server.model.*;
import it.unipr.soi23.game_web_server.repo.PersistenceRepo;
import it.unipr.soi23.game_web_server.service.Soi23GameWebServerService;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.stream.StreamSupport;

import static it.unipr.soi23.game_web_server.utils.Soi23GameWebServerConst.*;

@Service
public class Soi23GameWebServerServiceImpl implements Soi23GameWebServerService {

    private final MessageSendingOperations<String> messageSendingOperations;
    private final PersistenceRepo persistenceRepo;

    public Soi23GameWebServerServiceImpl( //
                                          MessageSendingOperations<String> messageSendingOperations, //
                                          PersistenceRepo persistenceRepo //
    ) {
        this.messageSendingOperations = messageSendingOperations;
        this.persistenceRepo = persistenceRepo;
    }

    @Override
    public WatchGameResponse watchGame(String gameId) {
        final GameData gameData = persistenceRepo.findGameData().findById(gameId).orElse(null);
        if (gameData == null) {
            return new WatchGameResponse().message(new Message() //
                    .type(Message.Type.ERROR) //
                    .code(Message.Code.GAME_NOT_FOUND));
        }
        final Iterable<Player> players = persistenceRepo.findPlayer().findAllByGameId(gameId);

        final WatchGameResponse response = new WatchGameResponse() //
                .teamsScore(gameData.getTeamsScore()) //
                .ballAnimation(gameData.getBallAnimation());
        players.forEach(response::addPlayer);

        return response;
    }

    @Override
    public RegisterResponse register(String gameId, String playerId) {
        final GameData gameDataRead = persistenceRepo.findGameData().findById(gameId).orElse(null);
        final boolean gameDataFound = gameDataRead != null;
        final GameData gameData = gameDataFound ? gameDataRead : new GameData(gameId);

        final Player player = createPlayer(gameId, playerId);
        if (player == null) {
            return new RegisterResponse().message(new Message() //
                    .type(Message.Type.ERROR) //
                    .code(Message.Code.PLAYER_ID_ALREADY_USED));
        }

        if (gameData.isPlaying()) {
            player.setReadyToStart(true);
        }
        persistenceRepo.insertPlayer().player(player).apply();
        if (!gameDataFound) {
            persistenceRepo.insertGameData().gameData(gameData).apply();
        }

        messageSendingOperations.convertAndSend( //
                TOPIC_GAME_PREFIX + gameId + TOPIC_GAME_PLAYERS_SUFFIX, //
                new PlayerDTO().fromPlayer(player));

        final Iterable<Player> players = persistenceRepo.findPlayer().findAllByGameId(gameId);

        final RegisterResponse response = new RegisterResponse() //
                .teamsScore(gameData.getTeamsScore()) //
                .ballAnimation(gameData.getBallAnimation()) //
                .token(player.getToken());
        players.forEach(response::addPlayer);

        return response;
    }

    @Override
    public GameDataDTO startGame(String gameId, StartGameRequest request) {
        final String playerId = retrieveFullPlayerId(gameId, request.getPlayerId());
        /* TODO
        Update the readyToStart property of the player and send the new Player
        to the front-end.
        Then, start the game if it can, or reset its ballAnimation to BALL_LOBBY_ANIMATION.
        Finally return the new GameData.
        NOTE: Keep in mind to persist the updates in the repository
         */
    }

    @Override
    public PlayerDTO movePlayer(String gameId, MovePlayerRequest request) {
        final String playerId = retrieveFullPlayerId(gameId, request.getPlayerId());
        /* TODO
        Update the Y value of the player using PlayerBroker and return it.
        NOTE: Keep in mind to persist the updates in the repository
         */
    }

    @Override
    public BallAnimation animationEnd(String gameId) {
        final GameData gameData = retrieveGameData(gameId, null);
        final Iterable<Player> players = persistenceRepo.findPlayer().findAllByGameId(gameId);
        final GameDataBroker.UpdateAnimationResult updateAnimationResult = new GameDataBroker() //
                .players(players) //
                .gameData(gameData) //
                .updateAnimation();

        /* TODO
        If updateAnimation result is SCORE or NEXT, return the new ballAnimation.
        If updateAnimation result is SCORE:
            - Reset every player's readyToStart
            - Send to the front-end every new Player
            - Send to every player the message PointScored
        NOTE: Keep in mind to persist the updates in the repository
         */
    }

    // Private

    private String retrieveFullPlayerId(String gameId, String playerId) {
        return playerId.concat(PLAYER_ID_SEPARATOR).concat(gameId);
    }

    private GameData retrieveGameData(String gameId, String token) {
        final GameData gameData = persistenceRepo.findGameData().findById(gameId).orElse(null);
        if (gameData == null) {
            /* TODO
            Send a message to the player to notify the error
             */
            throw new GameWebServerException(GAME_NOT_FOUND + gameId);
        }
        return gameData;
    }

    private Player retrievePlayer(String gameId, String playerId, String token) {
        final Player player = persistenceRepo.findPlayer().findById(playerId).orElse(null);
        if (player == null) {
            /* TODO
            Send a message to the player to notify the error
             */
            throw new GameWebServerException(PLAYER_NOT_FOUND + playerId);
        }
        final boolean isValidToken = new PlayerBroker() //
                .player(player) //
                .checkPlayerToken(token);
        if (!isValidToken) {
            /* TODO
            Send a message to the player to notify the error
             */
            throw new GameWebServerException(INVALID_PLAYER_TOKEN + playerId);
        }
        return player;
    }

    private Player createPlayer(String gameId, String playerId) {
        final String fullPlayerId = retrieveFullPlayerId(gameId, playerId);
        final boolean playerAlreadyExists = persistenceRepo.findPlayer().findById(fullPlayerId).isPresent();
        if (playerAlreadyExists) {
            return null;
        }

        final String token = UUID.randomUUID().toString();
        /* TODO
        Instantiate and return the new Player.
        NOTE: Use fullPlayerId as id
         */
    }

    private boolean canGameStart(String gameId) {
        /* TODO
        The game can start if:
            - All players are ready to start
            - There is at least one player for each team (side)
         */
    }

    private void sendMessage(String gameId, String token, Message.Type type, Message.Code code) {
        final Message msg = new Message() //
                .type(type) //
                .code(code);
        messageSendingOperations.convertAndSend( //
                TOPIC_GAME_PREFIX + gameId + TOPIC_GAME_MESSAGES_SUFFIX + token, //
                msg);
    }
}
