import { EventEmitter } from "../deps.ts";

import { Versions, Discord, Endpoints } from "./util/Constants.ts";
import Gateway from "./gateway/WebsocketHandler.ts";

import { Channel, Guild, GuildMember, DMChannel, DMGroupChannel, Message, User, Role } from "./Classes.ts";

/**
 * Class representing the main client
 * @extends EventEmitter
 *
 *            import { Coward } from "https://deno.land/x/Client/mod.ts";
 *            const client = new Coward("TOKEN_GOES_HERE");
 *
 *            client.on("ready", () => {
 * 		            console.log("READY!");
 *            });
 *
 *            client.connect();
 */
export class Client extends EventEmitter {
	private _userAgent: string =
	`DiscordBot (https://github.com/fox-cat/Client), ${Versions.THIS}`;
	private gateway: Gateway;

	// TODO: Store guilds and etc. in here

	/**
	 * Create a Client
	 *
	 *       const client = new Coward("TOKEN_HERE");
	 */
	public constructor(private token: string) {
		super();
		this.gateway = new Gateway(token, this);
	}

	/** Connect to the Discord API */
	connect() {
		this.gateway.connect();
	}

	/**
	 * Post a Channel
	 *
	 *       client.postChannel("GUILD_ID", {name: "new-channel", type: 0});
	 */
	postChannel(guildID: string, options: Options.postChannel): Promise<Channel> {
		return new Promise(async (resolve, reject) => {
			this.request( "POST", Endpoints.GUILD_CHANNELS(guildID), options )
				.then((data: any) => { resolve(Channel.new(data, this)); })
				.catch((err: any) => { reject(err); });
		});
	}

	/**
	 * Modify a Channel
	 *
	 *       client.modifyChannel("CHANNEL_ID", {name: "new-name"});
	 */
	modifyChannel(channelID: string, options: Options.modifyChannel): Promise<Channel> {
		return new Promise(async (resolve, reject) => {
			this.request( "PATCH", Endpoints.CHANNEL(channelID), options )
				.then((data: any) => { resolve(Channel.new(data, this)); })
				.catch((err: any) => { reject(err); })
		});
	}

	/**
	 * Delete a Channel
	 *
	 *       client.deleteChannel("CHANNEL_ID");
	 */
	deleteChannel(channelID: string): void {
		this.request( "DELETE", Endpoints.CHANNEL(channelID) );
	}

	/**
	 * Post a message in a channel
	 *
	 *       client.postMessage("CHANNEL_ID", "Message!");
	 */
	postMessage(channelID: string, content: string | Options.postMessage): Promise<Message> {
		if(typeof content === "string") { content = { content: content } }
		return new Promise(async (resolve, reject) => {
			this.request( "POST", Endpoints.CHANNEL_MESSAGES(channelID), content )
				.then((data: any) => { resolve(new Message(data, this)); })
				.catch((err: any) => { reject(err); });
		});
	}

	/**
	 * Modify a message in a channel
	 *
	 *       client.modifyMessage("CHANNEL_ID", "MESSAGE_ID", "Edited message!");
	 */
	modifyMessage(channelID: string, messageID: string, content: string | Options.modifyMessage): Promise<Message> {
		if(typeof content === "string") { content = { content: content } }
		return new Promise(async (resolve, reject) => {
			this.request( "PATCH", Endpoints.CHANNEL_MESSAGE(channelID, messageID), content )
				.then((data: any) => { resolve(new Message(data, this)); })
				.catch((err: any) => { reject(err); })
		})
	}

	/**
	 * Delete a message in a channel
	 *
	 *       client.deleteMessage("CHANNEL_ID", "MESSAGE_ID");
	 */
	deleteMessage(channelID: string, messageID: string): void {
		this.request( "DELETE", Endpoints.CHANNEL_MESSAGE(channelID, messageID) );
	}

	// TODO: bulkDeleteMessage(channelID: string, amount: number): void {}

	/**
	 * Put a reaction on a message.
	 *
	 *       client.putReaction("CHANNEL_ID", "MESSAGE_ID", "EMOJI");
	 */
	putReaction(channelID: string, messageID: string, emoji: string, userID?: string): void {
		this.request( "PUT", Endpoints.CHANNEL_MESSAGE_REACTION_USER(channelID, messageID, emoji, userID || "@me") );
	}

	/**
	 * Delete a reaction on a message.
	 *
	 *       client.deleteReaction("CHANNEL_ID", "MESSAGE_ID", "EMOJI", "USER_ID");
	 */
	deleteReaction(channelID: string, messageID: string, emoji: string, userID?: string): void {
		if(!userID) { userID = "@me"; }
		this.request( "DELETE", Endpoints.CHANNEL_MESSAGE_REACTION_USER(channelID, messageID, emoji, userID) );
	}

	/**
	 * Delete all reactions on a message.
	 *
	 *       client.deleteAllReactions("CHANNEL_ID", "MESSAGE_ID");
	 */
	deleteAllReactions(channelID: string, messageID: string): void {
		this.request( "DELETE", Endpoints.CHANNEL_MESSAGE_REACTIONS(channelID, messageID) );
	}

	/**
	 * Delete all reactions with an emoji on a message.
	 *
	 *       client.deleteAllEmojiReactions("CHANNEL_ID", "MESSAGE_ID", "EMOJI");
	 */
	deleteAllEmojiReactions(channelID: string, messageID: string, emoji: string): void {
		this.request( "DELETE", Endpoints.CHANNEL_MESSAGE_REACTION(channelID, messageID, emoji) );
	}

	// TODO: putChannelPermissions ?

	// TODO: getChannelInvite, createChannelInvite ?

	/**
	 * Start typing in a channel. Bots should usually not use this, however if a bot is responding to a command and expects the computation to take a few seconds, this may be used to let the user know that the bot is processing their message.
	 *
	 *       client.postTyping("CHANNEL_ID");
	 */
	postTyping(channelID: string): void {
		this.request( "POST", Endpoints.CHANNEL_TYPING(channelID) );
	}

	/**
	 * Pin a message in a channel.
	 *
	 *       client.putPin("CHANNEL_ID", "MESSAGE_ID");
	 */
	putPin(channelID: string, messageID: string): void {
		this.request( "PUT", Endpoints.CHANNEL_PIN(channelID, messageID) );
	}

	/**
	 * Delete a pinned message in a channel.
	 *
	 *       client.deletePin("CHANNEL_ID", "MESSAGE_ID");
	 */
	deletePin(channelID: string, messageID: string): void {
		this.request( "DELETE", Endpoints.CHANNEL_PIN(channelID, messageID) );
	}

	// TODO: Emoji (https://discord.com/developers/docs/resources/emoji)

	/**
	 * Modify a guild's settings.
	 *
	 *       client.modifyGuild("GUILD_ID", {name: "new-name"});
	 */
	modifyGuild(guildID: string, options: Options.modifyGuild): Promise<Guild> {
		return new Promise(async (resolve, reject) => {
			this.request( "PATCH", Endpoints.GUILD(guildID) )
				.then((data: any) => { resolve(new Guild(data, this)); })
				.catch((err: any) => { reject(err); } );
		});
	}

	/**
	 * Delete a guild. (MUST be guild owner)
	 *
	 *       client.deleteGuild("GUILD_ID");
	 */
	deleteGuild(guildID: string): void {
		this.request( "DELETE", Endpoints.GUILD(guildID) );
	}

	/**
	 * Modify a member.
	 *
	 *       client.modifyMember("GUILD_ID", "MEMBER_ID", {nick: "haha nickname"});
	 */
	modifyMember(guildID: string, memberID: string, options: Options.modifyMember): Promise<GuildMember> {
		return new Promise(async (resolve, reject) => {
			this.request( "PATCH", Endpoints.GUILD_MEMBER(guildID, memberID) )
				.then((data: any) => { resolve(new GuildMember(data, this)); });
				.catch((err: any) => { reject(err); });
		});
	}

	private async request(method: string, url: string, data?: any) {
		let json: {[k: string]: any} = {
			method: method,
			headers: {
				"User-Agent": this._userAgent,
				"Accept-Encoding": "gzip,deflate",
				"Content-Type": "application/json",
				"Authorization": "Bot " + this.token
			}
		}
		if(data !== undefined) json.body = JSON.stringify(data);
		const response = await fetch(Discord.API + url, json);
		if(response.status == 204) { return null; }
		return response.json();
	}
}

/** Namespace for functions */
export namespace Options {
	export interface client {

	}

	export interface postChannel {
		name: string,
		type: number,
		position?: number,
		//permission_overwrites?:
		topic?: string,
		nsfw?: boolean,
		bitrate?: number,
		user_limit?: number,
		rate_limit_per_user?: number,
		parent_id?: string
	}

	export interface modifyChannel {
		name?: string,
		type?: number,
		position?: number,
		topic?: string,
		nsfw?: boolean,
		rate_limit_per_user?: number,
		bitrate?: number,
		user_limit?: number,
		//permission_overwrites?: Array<>,
		parent_id?: string
    }

	export interface postMessage {
		content?: string,
		tts?: boolean,
		// TODO file:
		embed?: any
	}

	export interface modifyMessage {
		content?: string,
		// TODO: file
		embed?: any
	}

	/**
	 * @interface modifyGuild
	 */
	export interface modifyGuild {
		name?: string,
		region?: string,
		verification_level?: number,
		default_message_notifcations?: number,
		explicit_content_filter?: number,
		afk_channel_id?: string,
		afk_timeout?: number,
		// TODO: icon
		owner_id?: string,
		// TODO: splash
		// TODO: banner
		system_channel_id?: string,
		rules_channel_id?: string,
		public_updates_channel_id?: string,
		preferred_locale?: string
	}

	/**
	 * @interface modifyMember
	 */
	export interface modifyMember {
		nick?: string,
		//roles?: Array<string>
		mute?: boolean,
		deaf?: boolean,
		/** The channel to move the member to (if they are in a voice channel) */
		channel_id?: string
	}
}
