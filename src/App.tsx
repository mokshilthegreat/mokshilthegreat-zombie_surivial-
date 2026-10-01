import React, { useState, useEffect, useRef, useCallback } from 'react';

import { GameSaveData, LocationConfig } from './types/game';
import {
  loadGameData,
  saveGameData,
  resetGameData,
  addPlayerXp,
} from './game/storage';

import { LEVELS_CATALOG } from './game/levels';

import {
  GameEngine,
  GameHUDState,
  MissionResult,
} from './game/engine/GameEngine';

import { soundManager } from './audio/soundManager';

import { MainMenu } from './components/MainMenu';
import { GameHUD } from './components/GameHUD';
import { WorldMapModal } from './components/WorldMapModal';
import { ArmoryModal } from './components/ArmoryModal';
import { CharacterModal } from './components/CharacterModal';
import { AchievementsModal } from './components/AchievementsModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';
import { PauseModal } from './components/PauseModal';
import { MissionResultModal } from './components/MissionResultModal';

import { adMobService } from './services/admob';
import { AdMobBanner } from './components/AdMobBanner';
import { AdMobModal } from './components/AdMobModal';

export type Screen =
  | 'menu'
  | 'character'
  | 'armory'
  | 'map'
  | 'game'
  | 'achievements'
  | 'howToPlay'
  | 'settings';

export default function App() {
  const [saveData, setSaveData] = useState<GameSaveData>(() =>
    loadGameData()
  );

  const [currentScreen, setCurrentScreen] =
    useState<Screen>('menu');

  const [previousScreen, setPreviousScreen] =
    useState<Screen>('menu');

  const [isPaused, setIsPaused] = useState(false);

  const [currentLocation, setCurrentLocation] =
    useState<LocationConfig>(LEVELS_CATALOG[0]);

  const [hudState, setHudState] =
    useState<GameHUDState | null>(null);

  const [missionResult, setMissionResult] =
    useState<MissionResult | null>(null);

  const [leveledUp, setLeveledUp] = useState(false);

  const [newLevel, setNewLevel] = useState(1);

  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const engineRef =
    useRef<GameEngine | null>(null);

  // Prevent duplicate NEXT LEVEL taps.
  const advancingLevelRef =
    useRef(false);

  // ============================================================
  // ADMOB WEB MODAL STATE
  // ============================================================

  const [adModalState, setAdModalState] = useState<{
    type: 'interstitial' | 'rewarded' | null;
    onDismiss: () => void;
    onReward?: () => void;
  } | null>(null);

  // ============================================================
  // INITIALIZE ADMOB
  // ============================================================

  useEffect(() => {
    void adMobService.initialize();

    adMobService.registerWebModalHandler((state) => {
      setAdModalState(state);
    });
  }, []);

  // ============================================================
  // REWARDED AD REVIVE
  // ============================================================

  const handleWatchAdRevive = useCallback(() => {
    saveGameData(saveData);

    if (engineRef.current) {
      engineRef.current.pauseForAd();
    }

    setIsPaused(true);

    let rewardEarned = false;

    adMobService.showRewardedAd({
      onRewardEarned: () => {
        rewardEarned = true;
      },

      onDismissed: () => {
        if (rewardEarned) {
          setMissionResult(null);
          setIsPaused(false);

          if (engineRef.current) {
            engineRef.current.resumeFromAd(true);
          }

          window.focus();

          if (canvasRef.current) {
            canvasRef.current.focus();
          }
        } else {
          setIsPaused(false);

          if (engineRef.current) {
            engineRef.current.resumeFromAd(false);
          }
        }
      },

      onFailed: (err) => {
        console.warn('[AdMob] Rewarded failed:', err);

        setIsPaused(false);

        if (engineRef.current) {
          engineRef.current.resumeFromAd(false);
        }
      },
    });
  }, [saveData]);

  // ============================================================
  // AUDIO SETTINGS SYNC
  // ============================================================

  useEffect(() => {
    soundManager.setVolumes(
      saveData.settings.masterVolume,
      saveData.settings.sfxVolume,
      saveData.settings.ambientVolume
    );
  }, [saveData.settings]);

  // ============================================================
  // MISSION COMPLETE / GAME OVER
  // ============================================================

  const handleGameOver = useCallback(
    (result: MissionResult) => {
      let currentSave = loadGameData();

      let isLevelUp = false;
      let finalLevel = currentSave.playerLevel;

      // Rewards
      const updatedCoins =
        currentSave.coins + result.coinsEarned;

      const updatedDna =
        currentSave.zombieDna + result.dnaEarned;

      const updatedKills =
        currentSave.totalKills + result.kills;

      const updatedBossKills =
        currentSave.totalBossKills +
        (result.location.isBossStage && result.won ? 1 : 0);

      // XP
      const xpResult =
        addPlayerXp(currentSave, result.xpEarned);

      currentSave = xpResult.data;

      isLevelUp = xpResult.leveledUp;
      finalLevel = currentSave.playerLevel;

      const updatedCompleted = [
        ...currentSave.completedLocations,
      ];

      const updatedUnlocked = [
        ...currentSave.unlockedLocations,
      ];

      // Unlock next level
      if (result.won) {
        if (
          !updatedCompleted.includes(
            result.location.id
          )
        ) {
          updatedCompleted.push(result.location.id);
        }

        const nextSectorId =
          result.location.id + 1;

        if (
          nextSectorId <= 50 &&
          !updatedUnlocked.includes(nextSectorId)
        ) {
          updatedUnlocked.push(nextSectorId);
        }
      }

      const finalSave: GameSaveData = {
        ...currentSave,
        coins: updatedCoins,
        zombieDna: updatedDna,
        totalKills: updatedKills,
        totalBossKills: updatedBossKills,
        completedLocations: updatedCompleted,
        unlockedLocations: updatedUnlocked,
      };

      saveGameData(finalSave);

      setSaveData(finalSave);
      setLeveledUp(isLevelUp);
      setNewLevel(finalLevel);

      setMissionResult(result);
      setIsPaused(false);
    },
    []
  );

  // ============================================================
  // START MISSION
  // ============================================================

  const startMission = useCallback(
    (loc: LocationConfig) => {
      soundManager.init();

      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }

      advancingLevelRef.current = false;

      setCurrentLocation(loc);
      setMissionResult(null);
      setHudState(null);
      setIsPaused(false);
      setCurrentScreen('game');
    },
    []
  );

  // ============================================================
  // QUICK PLAY
  // ============================================================

  const handleQuickPlay = () => {
    const highestId = Math.max(
      ...saveData.unlockedLocations,
      1
    );

    const targetLoc =
      LEVELS_CATALOG.find(
        (level) => level.id === highestId
      ) || LEVELS_CATALOG[0];

    startMission(targetLoc);
  };

  // ============================================================
  // NEW GAME
  // ============================================================

  const handleNewGame = () => {
    const fresh = resetGameData();

    setSaveData(fresh);

    startMission(LEVELS_CATALOG[0]);
  };

  // ============================================================
  // NAVIGATION
  // ============================================================

  const navigateTo = (screen: Screen) => {
    soundManager.init();
    soundManager.playClick();

    setPreviousScreen(currentScreen);

    if (
      currentScreen === 'game' &&
      engineRef.current
    ) {
      engineRef.current.pause();
      setIsPaused(true);
    }

    setCurrentScreen(screen);
  };

  // ============================================================
  // GO BACK
  // ============================================================

  const goBack = () => {
    soundManager.playClick();

    if (
      previousScreen === 'game' &&
      engineRef.current
    ) {
      setCurrentScreen('game');
    } else {
      setCurrentScreen('menu');
    }
  };

  // ============================================================
  // CREATE GAME ENGINE
  // ============================================================

  useEffect(() => {
    if (currentScreen !== 'game') {
      return;
    }

    if (!canvasRef.current) {
      return;
    }

    if (!engineRef.current) {
      const engine = new GameEngine(
        canvasRef.current,
        currentLocation,
        saveData,

        (hud: GameHUDState) => {
          setHudState(hud);
        },

        (result: MissionResult) => {
          handleGameOver(result);
        }
      );

      engineRef.current = engine;

      engine.start();
    }

    // ==========================================================
    // ESC PAUSE
    // ==========================================================

    const handleKeyDown = (
      e: KeyboardEvent
    ) => {
      if (e.key !== 'Escape') {
        return;
      }

      if (
        missionResult ||
        !engineRef.current
      ) {
        return;
      }

      setIsPaused((previous) => {
        const next = !previous;

        if (next) {
          engineRef.current?.pause();
        } else {
          engineRef.current?.resume();
        }

        return next;
      });
    };

    window.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [
    currentScreen,
    currentLocation,
    saveData,
    handleGameOver,
    missionResult,
  ]);

  // ============================================================
  // PAUSE
  // ============================================================

  const handlePause = () => {
    if (engineRef.current) {
      engineRef.current.pause();
      setIsPaused(true);
    }
  };

  // ============================================================
  // RESUME
  // ============================================================

  const handleResume = () => {
    if (engineRef.current) {
      engineRef.current.resume();
      setIsPaused(false);
    }
  };

  // ============================================================
  // RESTART CURRENT LEVEL
  // ============================================================

  const handleRestartMission = () => {
    const locationToRestart =
      currentLocation;

    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }

    setMissionResult(null);
    setHudState(null);
    setIsPaused(false);

    startMission(locationToRestart);
  };

  // ============================================================
  // QUIT TO MENU
  // ============================================================

  const handleQuitToMenu = () => {
    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }

    advancingLevelRef.current = false;

    setIsPaused(false);
    setMissionResult(null);
    setHudState(null);

    setCurrentScreen('menu');
    setPreviousScreen('menu');
  };

  // ============================================================
  // TOUCH DEVICE DETECTION
  // ============================================================

  const [isTouchDevice, setIsTouchDevice] =
    useState(() => {
      if (typeof window === 'undefined') {
        return false;
      }

      return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.innerWidth <= 900
      );
    });

  useEffect(() => {
    const handleTouch = () => {
      setIsTouchDevice(true);
    };

    const handleResize = () => {
      if (window.innerWidth <= 900) {
        setIsTouchDevice(true);
      }
    };

    window.addEventListener(
      'touchstart',
      handleTouch,
      { passive: true }
    );

    window.addEventListener(
      'resize',
      handleResize
    );

    return () => {
      window.removeEventListener(
        'touchstart',
        handleTouch
      );

      window.removeEventListener(
        'resize',
        handleResize
      );
    };
  }, []);

  // Keep this state available without changing existing UI.
  void isTouchDevice;

  // ============================================================
  // MOBILE CONTROLS
  // ============================================================

  const showMobileControls =
    currentScreen === 'game' &&
    !isPaused &&
    !missionResult;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="w-full h-full min-h-[100dvh] bg-[#020714] flex justify-center overflow-hidden overscroll-none touch-none">

      <main
        id="app-root"
        className="game-app game-shell relative w-full h-full min-h-[100dvh] overflow-hidden overscroll-none bg-slate-950 font-sans text-slate-100 select-none"
      >

        {/* ======================================================
            MAIN MENU
            ====================================================== */}

        {currentScreen === 'menu' && (
          <MainMenu
            saveData={saveData}
            onPlay={handleQuickPlay}
            onNewGame={handleNewGame}
            onOpenWorldMap={() =>
              navigateTo('map')
            }
            onOpenArmory={() =>
              navigateTo('armory')
            }
            onOpenCharacter={() =>
              navigateTo('character')
            }
            onOpenAchievements={() =>
              navigateTo('achievements')
            }
            onOpenHowToPlay={() =>
              navigateTo('howToPlay')
            }
            onOpenSettings={() =>
              navigateTo('settings')
            }
          />
        )}

        {/* ======================================================
            CHARACTER
            ====================================================== */}

        {currentScreen === 'character' && (
          <CharacterModal
            saveData={saveData}
            onSaveDataUpdated={(newData) => {
              setSaveData(newData);

              engineRef.current?.updateSaveData(
                newData
              );
            }}
            onClose={goBack}
          />
        )}

        {/* ======================================================
            ARMORY
            ====================================================== */}

        {currentScreen === 'armory' && (
          <ArmoryModal
            saveData={saveData}
            onSaveDataUpdated={(newData) => {
              setSaveData(newData);

              engineRef.current?.updateSaveData(
                newData
              );
            }}
            onClose={goBack}
          />
        )}

        {/* ======================================================
            WORLD MAP
            ====================================================== */}

        {currentScreen === 'map' && (
          <WorldMapModal
            unlockedLocationIds={
              saveData.unlockedLocations
            }
            completedLocationIds={
              saveData.completedLocations
            }
            playerLevel={saveData.playerLevel}
            onSelectLocation={(loc) => {
              startMission(loc);
            }}
            onClose={goBack}
          />
        )}

        {/* ======================================================
            ACHIEVEMENTS
            ====================================================== */}

        {currentScreen === 'achievements' && (
          <AchievementsModal
            saveData={saveData}
            onSaveDataUpdated={(newData) =>
              setSaveData(newData)
            }
            onClose={goBack}
          />
        )}

        {/* ======================================================
            HOW TO PLAY
            ====================================================== */}

        {currentScreen === 'howToPlay' && (
          <HowToPlayModal
            onClose={goBack}
          />
        )}

        {/* ======================================================
            SETTINGS
            ====================================================== */}

        {currentScreen === 'settings' && (
          <SettingsModal
            saveData={saveData}
            onSaveDataUpdated={(newData) =>
              setSaveData(newData)
            }
            onClose={goBack}
          />
        )}

        {/* ======================================================
            GAMEPLAY
            ====================================================== */}

        <div
          className={`game-screen absolute inset-0 w-full min-h-[100dvh] h-[100dvh] overflow-hidden z-0 select-none touch-none overscroll-none ${
            currentScreen === 'game'
              ? 'block'
              : 'hidden'
          }`}
        >

          <div className="combat-world">
            <canvas
              ref={canvasRef}
              className="w-full h-full block cursor-crosshair touch-none"
            />
          </div>

          {/* ==================================================
              GAME HUD
              ================================================== */}

          {hudState &&
            currentScreen === 'game' && (
              <GameHUD
                hud={hudState}

                onPause={handlePause}

                onUseMedkit={() =>
                  engineRef.current?.useMedkit()
                }

                onThrowGrenade={() =>
                  engineRef.current?.throwGrenade()
                }

                onReload={() =>
                  engineRef.current?.reload()
                }

                onDash={() =>
                  engineRef.current?.dash()
                }

                onSwitchWeapon={(slot) =>
                  engineRef.current?.switchWeapon(
                    slot
                  )
                }

                onVirtualMove={(x, y) =>
                  engineRef.current?.setVirtualMove(
                    x,
                    y
                  )
                }

                onVirtualAim={(x, y) =>
                  engineRef.current?.setVirtualAim(
                    x,
                    y
                  )
                }

                onVirtualShoot={(shooting) =>
                  engineRef.current?.setVirtualShoot(
                    shooting
                  )
                }

                showMobileControls={
                  showMobileControls
                }
              />
            )}

          {/* ==================================================
              PAUSE MODAL
              ================================================== */}

          {isPaused &&
            currentScreen === 'game' &&
            !missionResult && (
              <PauseModal
                onResume={handleResume}
                onRestart={
                  handleRestartMission
                }
                onOpenWorldMap={() =>
                  navigateTo('map')
                }
                onOpenCharacters={() =>
                  navigateTo('character')
                }
                onOpenArmory={() =>
                  navigateTo('armory')
                }
                onOpenAchievements={() =>
                  navigateTo('achievements')
                }
                onOpenSettings={() =>
                  navigateTo('settings')
                }
                onQuitToMenu={
                  handleQuitToMenu
                }
              />
            )}

          {/* ==================================================
              MISSION RESULT MODAL
              ================================================== */}

          {missionResult &&
            currentScreen === 'game' && (
              <MissionResultModal
                result={missionResult}
                leveledUp={leveledUp}
                newLevel={newLevel}

                onRetry={
                  handleRestartMission
                }

                onNextMission={() => {
                  if (
                    advancingLevelRef.current
                  ) {
                    return;
                  }

                  const nextId =
                    missionResult.location.id +
                    1;

                  const nextLoc =
                    LEVELS_CATALOG.find(
                      (level) =>
                        level.id === nextId
                    );

                  // Level 50 = final level.
                  if (!nextLoc) {
                    handleQuitToMenu();
                    return;
                  }

                  // Prevent double tap.
                  advancingLevelRef.current =
                    true;

                  soundManager.playClick();

                  // Stop current engine.
                  if (engineRef.current) {
                    engineRef.current.destroy();
                    engineRef.current = null;
                  }

                  setMissionResult(null);
                  setHudState(null);
                  setIsPaused(true);

                  // Show interstitial test ad.
                  // After close/failure, the callback starts
                  // the next level.
                  adMobService.showInterstitialAd(
                    () => {
                      startMission(nextLoc);
                    }
                  );
                }}

                onReturnToBase={() => {
                  if (engineRef.current) {
                    engineRef.current.destroy();
                    engineRef.current = null;
                  }

                  advancingLevelRef.current =
                    false;

                  setIsPaused(false);
                  setMissionResult(null);
                  setHudState(null);

                  navigateTo('map');
                }}

                onWatchAdRevive={
                  handleWatchAdRevive
                }
              />
            )}
        </div>

        {/* ======================================================
            ADMOB BANNER
            ====================================================== */}

        <AdMobBanner
          currentScreen={currentScreen}
        />

        {/* ======================================================
            ADMOB INTERSTITIAL / REWARDED MODAL
            ====================================================== */}

        <AdMobModal
          modalState={adModalState}
          onClose={() =>
            setAdModalState(null)
          }
        />

      </main>
    </div>
  );
}