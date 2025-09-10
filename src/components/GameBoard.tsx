import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import PlayingCard from './PlayingCard';
import { GameState, GamePhase, GameResult } from '@/types/game';
import { createDeck, createHand, shouldDealerHit, determineWinner } from '@/utils/gameLogic';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const GameBoard = () => {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'betting',
    result: null,
    playerHand: createHand([]),
    dealerHand: createHand([]),
    deck: createDeck(),
    chips: 1000,
    bet: 0,
    isDealing: false
  });

  const placeBet = (amount: number) => {
    if (gameState.chips >= amount) {
      setGameState(prev => ({
        ...prev,
        bet: amount,
        chips: prev.chips - amount,
        phase: 'dealing'
      }));
      dealInitialCards(amount);
    }
  };

  const dealInitialCards = async (bet: number) => {
    const deck = createDeck();
    setGameState(prev => ({ ...prev, isDealing: true, deck }));

    // Deal cards with animation delays
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const playerCards = [deck.pop()!, deck.pop()!];
    const dealerCards = [deck.pop()!, deck.pop()!];
    
    const playerHand = createHand(playerCards);
    const dealerHand = createHand(dealerCards);
    
    setGameState(prev => ({
      ...prev,
      playerHand,
      dealerHand,
      deck: deck,
      phase: playerHand.isBlackjack ? 'dealerTurn' : 'playerTurn',
      isDealing: false
    }));

    if (playerHand.isBlackjack) {
      setTimeout(() => resolveDealerTurn(playerHand, dealerHand, deck), 1000);
    }
  };

  const hit = () => {
    if (gameState.phase !== 'playerTurn') return;
    
    const newDeck = [...gameState.deck];
    const newCard = newDeck.pop()!;
    const newPlayerHand = createHand([...gameState.playerHand.cards, newCard]);
    
    setGameState(prev => ({
      ...prev,
      playerHand: newPlayerHand,
      deck: newDeck,
      phase: newPlayerHand.isBust ? 'gameOver' : 'playerTurn'
    }));

    if (newPlayerHand.isBust) {
      setTimeout(() => {
        setGameState(prev => ({ ...prev, result: 'lose' }));
        toast({
          title: "Bust!",
          description: "You went over 21. Better luck next time!",
          variant: "destructive"
        });
      }, 500);
    }
  };

  const stand = () => {
    if (gameState.phase !== 'playerTurn') return;
    
    setGameState(prev => ({ ...prev, phase: 'dealerTurn' }));
    resolveDealerTurn(gameState.playerHand, gameState.dealerHand, gameState.deck);
  };

  const resolveDealerTurn = async (playerHand: any, dealerHand: any, deck: any[]) => {
    let currentDealerHand = dealerHand;
    let currentDeck = [...deck];

    while (shouldDealerHit(currentDealerHand)) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCard = currentDeck.pop()!;
      currentDealerHand = createHand([...currentDealerHand.cards, newCard]);
      
      setGameState(prev => ({
        ...prev,
        dealerHand: currentDealerHand,
        deck: currentDeck
      }));
    }

    const result = determineWinner(playerHand, currentDealerHand);
    let winnings = 0;

    if (result === 'win') {
      winnings = playerHand.isBlackjack ? gameState.bet * 2.5 : gameState.bet * 2;
      toast({
        title: "You Win!",
        description: `You won ${winnings} chips!`,
      });
    } else if (result === 'push') {
      winnings = gameState.bet;
      toast({
        title: "Push!",
        description: "It's a tie! Your bet is returned.",
      });
    } else {
      toast({
        title: "You Lose",
        description: "The dealer wins this round.",
        variant: "destructive"
      });
    }

    setGameState(prev => ({
      ...prev,
      result,
      chips: prev.chips + winnings,
      phase: 'gameOver'
    }));
  };

  const newRound = () => {
    setGameState(prev => ({
      ...prev,
      phase: 'betting',
      result: null,
      playerHand: createHand([]),
      dealerHand: createHand([]),
      bet: 0,
      isDealing: false
    }));
  };

  const getResultMessage = () => {
    if (!gameState.result) return '';
    
    switch (gameState.result) {
      case 'win':
        return gameState.playerHand.isBlackjack ? 'BLACKJACK!' : 'YOU WIN!';
      case 'lose':
        return gameState.playerHand.isBust ? 'BUST!' : 'DEALER WINS';
      case 'push':
        return 'PUSH';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen casino-table p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-2">
            Royal 21
          </h1>
          <p className="text-casino-cream text-lg">
            Premium Blackjack Experience
          </p>
        </div>

        {/* Chips Display */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-black/30 rounded-lg px-6 py-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">$</span>
            </div>
            <span className="text-2xl font-bold text-primary">{gameState.chips}</span>
            <span className="text-casino-cream">Chips</span>
          </div>
        </div>

        {/* Dealer Section */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-casino-cream mb-4">
            Dealer {gameState.dealerHand.cards.length > 0 && gameState.phase !== 'playerTurn' && 
              `(${gameState.dealerHand.value})`}
          </h2>
          <div className="flex justify-center gap-2 mb-4">
            {gameState.dealerHand.cards.map((card, index) => (
              <PlayingCard 
                key={index} 
                card={card}
                isHidden={index === 1 && gameState.phase === 'playerTurn'}
                className={gameState.result === 'lose' && !gameState.playerHand.isBust ? 'win-glow' : ''}
              />
            ))}
          </div>
        </div>

        {/* Result Message */}
        {gameState.result && (
          <div className="text-center mb-6">
            <div className={cn(
              "text-3xl md:text-4xl font-bold px-6 py-3 rounded-lg inline-block",
              gameState.result === 'win' ? 'text-casino-green bg-casino-green/20' :
              gameState.result === 'lose' ? 'text-casino-red bg-casino-red/20' :
              'text-primary bg-primary/20'
            )}>
              {getResultMessage()}
            </div>
          </div>
        )}

        {/* Player Section */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-casino-cream mb-4">
            Your Hand {gameState.playerHand.cards.length > 0 && `(${gameState.playerHand.value})`}
          </h2>
          <div className="flex justify-center gap-2 mb-4">
            {gameState.playerHand.cards.map((card, index) => (
              <PlayingCard 
                key={index} 
                card={card}
                className={cn(
                  gameState.result === 'win' ? 'win-glow' : '',
                  gameState.playerHand.isBust ? 'bust-shake' : ''
                )}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          {gameState.phase === 'betting' && (
            <div className="space-y-4">
              <p className="text-casino-cream text-lg">Place your bet:</p>
              <div className="flex justify-center gap-4 flex-wrap">
                {[50, 100, 250, 500].map(amount => (
                  <Button
                    key={amount}
                    onClick={() => placeBet(amount)}
                    disabled={gameState.chips < amount}
                    className="btn-gold min-w-[80px]"
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {gameState.phase === 'playerTurn' && (
            <div className="flex justify-center gap-4">
              <Button onClick={hit} className="btn-gold min-w-[100px]">
                Hit
              </Button>
              <Button onClick={stand} variant="secondary" className="min-w-[100px]">
                Stand
              </Button>
            </div>
          )}

          {gameState.phase === 'dealerTurn' && (
            <div className="text-casino-cream text-lg">
              Dealer is playing...
            </div>
          )}

          {gameState.phase === 'gameOver' && (
            <Button onClick={newRound} className="btn-gold min-w-[120px]">
              New Round
            </Button>
          )}
        </div>

        {/* Current Bet Display */}
        {gameState.bet > 0 && (
          <div className="text-center mt-6">
            <div className="inline-flex items-center gap-2 bg-black/20 rounded-lg px-4 py-2">
              <span className="text-casino-cream">Current Bet:</span>
              <span className="text-primary font-bold">${gameState.bet}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;