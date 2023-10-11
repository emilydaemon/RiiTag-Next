import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import prisma from '@/lib/db';
import { DATA } from '@/lib/constants/filePaths';
import { exists } from '@/lib/utils/fileUtils';
import xml2js from 'xml2js';

const removePunctuation = key => key.replace(/[^\s\w]/g, '').replace(/™/g, ''); // Remove punctuation from key


function findRegionByGameId(games, gameId) {
  let regions = null;
  games.forEach(game => {
    if (game.id[0] === gameId) {
      regions = game.region[0].split(',').map(region => region.trim());
    }
  });
  return regions;
}

function findSimilarKeys(targetKey, keys) {
  const targetKeyWithoutPunctuation = removePunctuation(targetKey.toLowerCase());

  return keys.filter(key => {
    const keyWithoutPunctuation = removePunctuation(key.toLowerCase());
    return keyWithoutPunctuation === targetKeyWithoutPunctuation;
  });
}

export async function getGameNameFromTitlesTxt(txtname, gameId) {
  const filepath = path.resolve(DATA.GAMETDB, txtname);

  if (!(await exists(filepath))) {
    return null;
  }

  gameId = gameId.toUpperCase();
  const fileStream = fs.createReadStream(filepath, 'utf8');

  const linereader = readline.createInterface({
    input: fileStream,
    crlfDelay: Number.POSITIVE_INFINITY,
  });

  for await (const line of linereader) {
    if (line.startsWith(gameId)) {
      fileStream.close();
      return line.split(' = ')[1];
    }
  }

  fileStream.close();
  return null;
}

export async function getWiiGameName(gameId) {
  return getGameNameFromTitlesTxt('wiitdb.txt', gameId);
}

export async function getSwitchGameName(gameId) {
  return getGameNameFromTitlesTxt('switchtdb.txt', gameId);
}

export async function get3DSGameName(gameId) {
  return getGameNameFromTitlesTxt('3dstdb.txt', gameId);
}

export async function getWiiUGameName(gameId) {
  return getGameNameFromTitlesTxt('wiiutdb.txt', gameId);
}

export function getSimilarKeys(ids, gameName, keys) {
  const similarKeys = findSimilarKeys(gameName, keys);

  for (const key of similarKeys) {
    const foundIds = ids[key];
    if (foundIds) {
      return foundIds;
    }
  }

  return null;
}

export async function getSwitchGameIdByNameAndRegion(gameName) {
  const ids = JSON.parse(
    await fs.promises.readFile(path.resolve(DATA.IDS, 'switchtdb.json'), 'utf8')
  );

  let foundIds = ids[gameName];

  if (!foundIds) {
    foundIds = getSimilarKeys(ids, gameName, Object.keys(ids));

    if (!foundIds) {
      return null;
    }
  }

  try {
    const data = await fs.promises.readFile(
      path.resolve(DATA.IDS, 'switchtdb.xml'),
      'utf8'
    );

    const result = await new Promise((resolve, reject) => {
      xml2js.parseString(data, (parseError, parseResult) => {
        if (parseError) {
          reject(parseError);
        } else {
          resolve(parseResult);
        }
      });
    });

    const games = result.datafile.game;

    for (const gameId of foundIds) {
      const region = findRegionByGameId(games, gameId);

      for (const gameRegion of region) {
        // Europe
        if (region === "FR" && gameRegion === "FRA") {
          return gameId;
        }
        if (region === "DE" && gameRegion === "DEU") {
          return gameId;
        }
        if (region === "ES" && gameRegion === "ESP") {
          return gameId;
        }
        if (region === "AU" && gameRegion === "AUS") {
          return gameId;
        }
        if (region === "EN" || region === "FR" || region === "DE" || region === "ES" || region === "IT" || region === "NL" || region === "PT" || region === "SE" || region === "DK" || region === "NO" || region === "FI" && gameRegion === "EUR") {
          return gameId;
        }
        if (region === "KO" && gameRegion === "KOR") {
          return gameId;
        }
        if (region === "TW" && gameRegion === "TWN") {
          return gameId;
        }

        // Japan
        if (region === "JP" && gameRegion === "JPN") {
          return gameId;
        }

        // USA
        if (region === "EN" && gameRegion === "USA") {
          return gameId;
        }

        if (gameRegion === "ALL") {
          return gameId;
        }
      }
    }

    return null; // Game ID not found
  } catch {
    return null;
  }
}

export async function get3DSGameIdByNameAndRegion(gameName, region) {
  const threeds_ids = JSON.parse(
    await fs.promises.readFile(path.resolve(DATA.IDS, 'citra.json'), 'utf8')
  );

  let foundIds = threeds_ids[gameName];

  if (!foundIds) {
    foundIds = getSimilarKeys(threeds_ids, gameName, Object.keys(threeds_ids));

    if (!foundIds) {
      const threeds_ids1 = JSON.parse(
        await fs.promises.readFile(path.resolve(DATA.IDS, '3dstdb.json'), 'utf8')
      );

      foundIds = getSimilarKeys(threeds_ids1, gameName, Object.keys(threeds_ids1));

      if (!foundIds) {
        return null;
      }
    }
  }

  if (foundIds.length === 1) {
    return foundIds[0];
  }
  // Region-free, don't care
  if (foundIds[0].slice(-1) === 'A') {
    return foundIds[0];
  }

  /*  Regions and Fallbacks
        Europe: P with V Fallback, then X, Y or Z, then J.
        America: E with X, Y, or Z fallback, then P
        Japan: J with E fallback
        Everything else: P Fallback

        This should hopefully create a safety net where there's always some region avalible.
        If not just return "ids[gameName][0]" to use the first entry for the game.
    */
  for (const gameID of foundIds) {
    const gameRegion = gameID.slice(-1); // Last letter is the region

    // Europe
    if (region === 'FR' && gameRegion === 'F') {
      return gameID;
    }
    if (region === 'DE' && gameRegion === 'D') {
      return gameID;
    }
    if (region === 'ES' && gameRegion === 'S') {
      return gameID;
    }
    if (region === 'IT' && gameRegion === 'I') {
      return gameID;
    }
    if (region === 'NL' && gameRegion === 'H') {
      return gameID;
    }
    if (region === 'KO' && gameRegion === 'K') {
      return gameID;
    }
    if (region === 'TW' && gameRegion === 'W') {
      return gameID;
    }

    // Japan
    if (region === 'JP' && gameRegion === 'J') {
      return gameID;
    }
    // Japan fallback to english
    if (gameRegion === 'JP') {
      region = 'EN';
    }

    // USA
    if (region === 'EN' && gameRegion === 'E') {
      return gameID;
    }

    // Fallbacks
    if (gameRegion === 'P') {
      return gameID;
    }
    if (gameRegion === 'V') {
      return gameID;
    }
    if (gameRegion === 'X' || gameRegion === 'Y' || gameRegion === 'Z') {
      return gameID;
    }
    if (gameRegion === 'E') {
      return gameID;
    }
    if (gameRegion === 'J') {
      return gameID;
    }
  }

  // In case nothing was found, return the first ID.
  return threeds_ids[gameName][0];
}

export async function getWiiUGameIdByNameAndRegion(gameName, region) {
  const ids = JSON.parse(
    await fs.promises.readFile(path.resolve(DATA.IDS, 'cemu.json'), 'utf8')
  );

  const gameRegionsArray = ids[gameName];
  if (!gameRegionsArray) {
    return null;
  }

  // Flatten the array and include only games, not DLCs, etc.
  const gameRegions = {};
  gameRegionsArray.forEach((value) => {
    const key = Object.keys(value)[0];
    if (value[key].startsWith('00050000')) {
      gameRegions[key] = value[key];
    }
  });

  if (Object.keys(gameRegions).length === 0) {
    return null;
  }

  const europe = ['FR', 'DE', 'ES', 'IT', 'NL', 'KO', 'TW'];

  // Europe
  if (europe.includes(region) && gameRegions.EUR) {
    return gameRegions.EUR;
  }

  // Japan
  if (region === 'JP' && gameRegions.JPN) {
    return gameRegions.JPN;
  }

  // USA and Fallback
  return gameRegions.USA ?? null;
}

export async function updateRiiTag(user, gameId, gameName, gameConsole) {
  gameId = gameId.toUpperCase();

  const [, updatedUser] = await prisma.$transaction([
    prisma.game.upsert({
      where: {
        game_id_console: {
          game_id: gameId,
          console: gameConsole,
        },
      },
      create: {
        game_id: gameId,
        console: gameConsole,
        name: gameName,
        playlog: {
          create: {
            user_id: user.id,
          },
        },
      },
      update: {
        name: gameName,
        playcount: {
          increment: 1,
        },
        playlog: {
          create: {
            user_id: user.id,
          },
        },
      },
    }),
    prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        coins: {
          increment: 1,
        },
      },
    }),
  ]);
  return updatedUser;
}
