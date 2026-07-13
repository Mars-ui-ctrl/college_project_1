import React, { useState, useEffect, useRef } from 'react';
import { useResearchProject } from '../contexts/ResearchProjectContext';
import aiService from '../services/aiService';
import { useModal } from '../contexts/ModalContext';
import {
  FileText,
  X,
  MessageSquare,
  Sparkles,
  Award,
  Send,
  Loader,
  HelpCircle,
  RotateCcw,
  CheckCircle,
  ThumbsDown,
  ThumbsUp,
  Bookmark,
  Volume2,
} from 'lucide-react';

const Workspace = () => {
  const { showAlert } = useModal();
  const {
    currentProject,
    papers,
    currentPaper,
    openPaperTabs,
    openPaperInWorkspace,
    closePaperTab,
  } = useResearchProject();

  const [activeRightTab, setActiveRightTab] = useState('chat'); // 'chat' | 'quiz' | 'flashcards'
  
  // AI Chat States
  const [chatMessages, setChatMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Quiz States
  const [quiz, setQuiz] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [quizLoading, setQuizLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizResult, setQuizResult] = useState(null);

  // Flashcards States
  const [flashcards, setFlashcards] = useState([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [cardsLoading, setCardsLoading] = useState(false);

  // Auto-scroll chat history
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Load chat session when active paper changes
  const loadChatSession = async () => {
    if (!currentProject) return;
    try {
      setChatLoading(true);
      const paperId = currentPaper?._id || null;
      const res = await aiService.getChatSession(currentProject._id, paperId);
      if (res && res.data && res.data.chat) {
        setChatId(res.data.chat._id);
        setChatMessages(res.data.chat.messages || []);
      } else {
        setChatId(null);
        setChatMessages([]);
      }
    } catch (err) {
      console.error('Failed to load chat session:', err);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    loadChatSession();
    // Reset quizzes and flashcards to force fresh fetches per paper
    setQuiz(null);
    setQuizResult(null);
    setFlashcards([]);
  }, [currentPaper, currentProject]);

  // --- CHAT LOGIC ---
  const handleSendMessage = async (textToSend) => {
    const promptText = textToSend || userInput;
    if (!promptText.trim() || !currentProject) return;

    if (!textToSend) {
      setUserInput('');
    }

    try {
      setChatLoading(true);
      // Append message locally first for instant reaction
      setChatMessages((prev) => [
        ...prev,
        { sender: 'user', text: promptText, timestamp: new Date() },
      ]);

      const paperId = currentPaper?._id || null;
      const res = await aiService.sendMessage({
        projectId: currentProject._id,
        paperId,
        chatId,
        text: promptText,
      });

      if (res && res.data && res.data.chat) {
        setChatMessages(res.data.chat.messages);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Error generating AI response. Please try again.', timestamp: new Date() },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // --- QUIZ LOGIC ---
  const handleGenerateQuiz = async () => {
    if (!currentPaper) return;
    try {
      setQuizLoading(true);
      setQuizResult(null);
      const res = await aiService.generateQuiz({
        paperId: currentPaper._id,
        difficulty: selectedDifficulty,
      });
      if (res && res.data && res.data.quiz) {
        setQuiz(res.data.quiz);
        setUserAnswers(new Array(res.data.quiz.questions.length).fill(''));
      }
    } catch (err) {
      await showAlert('Failed to generate quiz: ' + err.message, 'Quiz Error');
    } finally {
      setQuizLoading(false);
    }
  };

  const handleAnswerSelect = (qIdx, ans) => {
    setUserAnswers((prev) => {
      const copy = [...prev];
      copy[qIdx] = ans;
      return copy;
    });
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    // Confirm all questions are answered
    if (userAnswers.some((a) => a === '')) {
      await showAlert('Please answer all questions before submitting.', 'Validation Error');
      return;
    }

    try {
      setQuizLoading(true);
      const res = await aiService.submitQuiz({
        quizId: quiz._id,
        answers: userAnswers,
      });
      if (res && res.data && res.data.quiz) {
        setQuizResult(res.data.quiz);
      }
    } catch (err) {
      await showAlert('Failed to submit quiz.', 'Error');
    } finally {
      setQuizLoading(false);
    }
  };

  // --- FLASHCARDS LOGIC ---
  const handleGenerateCards = async () => {
    if (!currentPaper) return;
    try {
      setCardsLoading(true);
      const res = await aiService.generateFlashcards({ paperId: currentPaper._id });
      if (res && res.data && res.data.flashcards) {
        setFlashcards(res.data.flashcards);
        setCardIndex(0);
        setCardFlipped(false);
      }
    } catch (err) {
      await showAlert('Failed to generate study flashcards.', 'Flashcards Error');
    } finally {
      setCardsLoading(false);
    }
  };

  const handleReviewFeedback = async (score) => {
    if (flashcards.length === 0) return;
    const activeCard = flashcards[cardIndex];
    try {
      await aiService.reviewCard(activeCard._id, score);
      
      // Move to next card
      if (cardIndex < flashcards.length - 1) {
        setCardFlipped(false);
        setTimeout(() => setCardIndex((prev) => prev + 1), 150);
      } else {
        await showAlert('Deck review completed! Retrying due cards in the next session.', 'Deck Completed');
        setFlashcards([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFavoriteCard = async (e) => {
    e.stopPropagation();
    if (flashcards.length === 0) return;
    const activeCard = flashcards[cardIndex];
    try {
      const res = await aiService.favoriteCard(activeCard._id);
      setFlashcards((prev) =>
        prev.map((c) => (c._id === activeCard._id ? { ...c, isFavorite: res.data.flashcard.isFavorite } : c))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
      {/* Workspace warning if no project is active */}
      {!currentProject ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center glass-panel rounded-2xl border border-slate-800">
          <FileText size={48} className="text-slate-600 mb-3" />
          <h2 className="font-heading font-bold text-white text-lg m-0">No Workspace Selected</h2>
          <p className="text-slate-400 text-xs mt-1 max-w-sm">
            Select a project using the switcher at the top header to load your reading pane.
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
          {/* --- LEFT PANE: PDF VIEW AND TABS --- */}
          <div className="flex-1 flex flex-col glass-panel rounded-2xl border border-slate-800/80 overflow-hidden min-h-0">
            {/* Tabs Header bar */}
            <div className="h-11 bg-slate-900 border-b border-slate-800/60 flex items-center px-4 overflow-x-auto gap-2 shrink-0">
              {openPaperTabs.map((tab) => (
                <div
                  key={tab._id}
                  onClick={() => openPaperInWorkspace(tab)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all border shrink-0 ${
                    currentPaper?._id === tab._id
                      ? 'bg-brand-primary/10 border-brand-primary text-brand-primary'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText size={10} />
                  <span className="truncate max-w-[100px]">{tab.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closePaperTab(tab._id);
                    }}
                    className="p-0.5 rounded hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition-all"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}

              {openPaperTabs.length === 0 && (
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">PDF Viewport Empty</span>
              )}
            </div>

            {/* Viewer Pane View */}
            <div className="flex-1 bg-slate-950/20 relative min-h-0">
              {currentPaper ? (
                (() => {
                  const relativeUrl = currentPaper.url.includes('/uploads/')
                    ? '/uploads/' + currentPaper.url.split('/uploads/')[1]
                    : currentPaper.url;
                  return (
                    <iframe
                      src={`${relativeUrl}#toolbar=1`}
                      className="w-full h-full border-0 bg-[#0b0f19]"
                      title={currentPaper.title}
                    ></iframe>
                  );
                })()
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <FileText size={36} className="text-slate-700 mb-2" />
                  <h4 className="font-heading font-bold text-xs text-slate-400 m-0">No active paper loaded</h4>
                  <p className="text-[10px] text-slate-500 max-w-xs leading-normal mt-1 mb-4">
                    Open a publication from your workspace list or browse files below.
                  </p>
                  
                  {/* Select Quick list */}
                  <div className="w-full max-w-xs space-y-1.5 overflow-y-auto max-h-36 px-2">
                    {papers.map((p) => (
                      <button
                        key={p._id}
                        onClick={() => openPaperInWorkspace(p)}
                        className="w-full text-left px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold truncate hover:border-brand-primary/45 transition-all block text-slate-300"
                      >
                        {p.title}
                      </button>
                    ))}
                    {papers.length === 0 && (
                      <div className="text-[10px] text-slate-600 font-semibold italic">No papers in library yet.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* --- RIGHT PANE: AI SERVICES & QUIZZES PANEL --- */}
          <div className="w-full md:w-96 glass-panel rounded-2xl border border-slate-800/80 overflow-hidden flex flex-col shrink-0 min-h-0">
            {/* View Switching Header */}
            <div className="h-12 bg-slate-900 border-b border-slate-800/60 flex items-center px-4 justify-between shrink-0">
              <div className="flex bg-slate-950/60 p-1 border border-slate-850 rounded-lg gap-0.5">
                {[
                  { id: 'chat', label: 'AI Chat', icon: MessageSquare },
                  { id: 'quiz', label: 'Quizzes', icon: HelpCircle },
                  { id: 'flashcards', label: 'Cards', icon: Award },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveRightTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                      activeRightTab === item.id
                        ? 'bg-slate-800 text-brand-secondary'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Panel Tab View Area */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {/* SUBTAB 1: AI CHAT */}
              {activeRightTab === 'chat' && (
                <div className="h-full flex flex-col min-h-0">
                  {/* Messages list */}
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0 pb-4">
                    {chatMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex flex-col max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed font-medium ${
                          msg.sender === 'user'
                            ? 'bg-brand-primary/15 border border-brand-primary/20 text-slate-100 self-end ml-auto'
                            : 'bg-slate-900 border border-slate-850 text-slate-200 self-start mr-auto'
                        }`}
                      >
                        {/* Message tag */}
                        <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                          {msg.sender === 'user' ? 'Researcher' : 'Nexus AI'}
                        </span>
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                      </div>
                    ))}
                    
                    {chatLoading && (
                      <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold p-2">
                        <Loader size={14} className="animate-spin text-brand-secondary" />
                        <span>Thinking...</span>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Action prompts shortcuts */}
                  <div className="flex flex-wrap gap-1.5 py-2.5 border-t border-slate-800/40 shrink-0">
                    {[
                      { label: 'Simplify Abstract', prompt: 'Summarize the core abstract of this paper in 3 simple bullet points.' },
                      { label: 'Explain Methodology', prompt: 'Describe the main algorithmic approach or methodology used here in plain terms.' },
                      { label: 'Key Results', prompt: 'What are the main performance outcomes or outperformance metrics claimed by this paper?' }
                    ].map((btn, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(btn.prompt)}
                        disabled={chatLoading}
                        className="text-[9px] font-bold bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-lg px-2.5 py-1.5 text-slate-400 hover:text-slate-200 transition-all"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Inputs keyboard row */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex gap-2 border-t border-slate-800/40 pt-3 shrink-0"
                  >
                    <input
                      type="text"
                      disabled={chatLoading}
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Ask AI about paper findings..."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:outline-none focus:border-brand-primary text-xs text-slate-100 placeholder:text-slate-600"
                    />
                    <button
                      type="submit"
                      disabled={chatLoading || !userInput.trim()}
                      className="h-9 w-9 bg-brand-primary text-white flex items-center justify-center rounded-xl hover:opacity-95 disabled:opacity-40 transition-all shrink-0"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              )}

              {/* SUBTAB 2: QUIZZES */}
              {activeRightTab === 'quiz' && (
                <div className="space-y-4">
                  {!currentPaper ? (
                    <div className="text-center text-slate-500 text-xs py-8 font-semibold">
                      Please load a PDF document in the reader panel to generate quizzes.
                    </div>
                  ) : (
                    <>
                      {/* Generation options if no quiz is active */}
                      {!quiz && !quizLoading && (
                        <div className="p-4 bg-slate-900/30 border border-slate-800/60 rounded-2xl text-center space-y-4">
                          <HelpCircle size={28} className="mx-auto text-slate-600" />
                          <div className="text-xs font-bold text-slate-300">Generate Evaluation Quiz</div>
                          
                          {/* Difficulty toggle */}
                          <div className="flex justify-center bg-slate-950 p-1 border border-slate-850 rounded-lg max-w-[200px] mx-auto gap-0.5">
                            {['easy', 'medium', 'hard'].map((diff) => (
                              <button
                                key={diff}
                                onClick={() => setSelectedDifficulty(diff)}
                                className={`px-2.5 py-1 rounded text-[9px] uppercase font-bold transition-all ${
                                  selectedDifficulty === diff ? 'bg-slate-800 text-amber-500' : 'text-slate-500'
                                }`}
                              >
                                {diff}
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={handleGenerateQuiz}
                            className="w-full py-2 bg-brand-primary text-white text-xs font-bold rounded-xl hover:opacity-95 transition-all shadow shadow-brand-primary/10"
                          >
                            Spawn AI Quiz
                          </button>
                        </div>
                      )}

                      {/* Quiz Generating progress spinner */}
                      {quizLoading && (
                        <div className="text-center py-12 flex flex-col items-center justify-center text-slate-500 space-y-2">
                          <Loader size={24} className="animate-spin text-brand-secondary" />
                          <span className="text-[10px] font-bold">Assembling AI Questions...</span>
                        </div>
                      )}

                      {/* Quiz Questionnaire View */}
                      {quiz && !quizLoading && !quizResult && (
                        <div className="space-y-5">
                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                            <span>Comprehension Quiz</span>
                            <span>Level: {quiz.difficulty}</span>
                          </div>

                          <div className="space-y-4">
                            {quiz.questions.map((q, qIdx) => (
                              <div key={qIdx} className="space-y-2">
                                <div className="text-xs font-bold text-slate-200">
                                  {qIdx + 1}. {q.question}
                                </div>
                                
                                {/* MCQ options */}
                                {q.type === 'mcq' && (
                                  <div className="grid grid-cols-1 gap-1.5">
                                    {q.options.map((opt, oIdx) => {
                                      const isSelected = userAnswers[qIdx] === opt;
                                      return (
                                        <button
                                          key={oIdx}
                                          onClick={() => handleAnswerSelect(qIdx, opt)}
                                          className={`w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                                            isSelected
                                              ? 'bg-brand-primary/10 border-brand-primary text-brand-primary font-bold'
                                              : 'bg-slate-900 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-200'
                                          }`}
                                        >
                                          {opt}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* True/False options */}
                                {q.type === 'tf' && (
                                  <div className="grid grid-cols-2 gap-2">
                                    {['True', 'False'].map((val) => {
                                      const isSelected = userAnswers[qIdx] === val;
                                      return (
                                        <button
                                          key={val}
                                          onClick={() => handleAnswerSelect(qIdx, val)}
                                          className={`py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                                            isSelected
                                              ? 'bg-brand-primary/10 border-brand-primary text-brand-primary'
                                              : 'bg-slate-900 border-slate-850 text-slate-400'
                                          }`}
                                        >
                                          {val}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Fill/Short inputs */}
                                {(q.type === 'fill' || q.type === 'short') && (
                                  <input
                                    type="text"
                                    value={userAnswers[qIdx] || ''}
                                    onChange={(e) => handleAnswerSelect(qIdx, e.target.value)}
                                    placeholder="Type answer key..."
                                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-850 text-[10px] text-slate-200 focus:outline-none focus:border-brand-primary"
                                  />
                                )}
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={handleSubmitQuiz}
                            className="w-full py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl hover:opacity-95 transition-all shadow"
                          >
                            Submit & Score Quiz
                          </button>
                        </div>
                      )}

                      {/* Quiz Grading Result Sheet */}
                      {quizResult && (
                        <div className="space-y-5">
                          {/* Score dashboard header */}
                          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-1">
                            <span className="text-[10px] text-emerald-500 font-extrabold uppercase tracking-widest block">Quiz Score Result</span>
                            <h3 className="font-heading font-black text-2xl text-white m-0">
                              {quizResult.score} / {quizResult.maxScore}
                            </h3>
                            <span className="text-[10px] text-slate-400 font-semibold block">
                              +{quizResult.score * 20} XP logged successfully
                            </span>
                          </div>

                          {/* Explanations listing */}
                          <div className="space-y-4">
                            {quizResult.questions.map((q, qIdx) => {
                              const userAns = (userAnswers[qIdx] || '').toLowerCase().trim();
                              const correctAns = q.correctAnswer.toLowerCase().trim();
                              const isCorrect = userAns === correctAns;

                              return (
                                <div key={qIdx} className="space-y-2 p-3 bg-slate-900/40 border border-slate-850 rounded-2xl">
                                  <div className="text-xs font-bold text-slate-200">
                                    {qIdx + 1}. {q.question}
                                  </div>
                                  <div className="text-[10px] font-semibold space-y-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-slate-500">Your Answer:</span>
                                      <span className={isCorrect ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                        {userAnswers[qIdx]}
                                      </span>
                                    </div>
                                    {!isCorrect && (
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-slate-500">Correct Answer:</span>
                                        <span className="text-emerald-400 font-bold">{q.correctAnswer}</span>
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-400 leading-normal border-t border-slate-850 pt-2 mt-2 font-medium">
                                    <strong>AI Explanation:</strong> {q.explanation}
                                  </p>
                                </div>
                              );
                            })}
                          </div>

                          <button
                            onClick={() => {
                              setQuiz(null);
                              setQuizResult(null);
                            }}
                            className="w-full py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                          >
                            <RotateCcw size={14} /> Retry Another Quiz
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* SUBTAB 3: FLASHCARDS */}
              {activeRightTab === 'flashcards' && (
                <div className="space-y-4">
                  {!currentPaper ? (
                    <div className="text-center text-slate-500 text-xs py-8 font-semibold">
                      Please load a PDF document in the reader panel to generate flashcards.
                    </div>
                  ) : (
                    <>
                      {/* Generation dashboard if empty */}
                      {flashcards.length === 0 && !cardsLoading && (
                        <div className="p-4 bg-slate-900/30 border border-slate-800/60 rounded-2xl text-center space-y-3">
                          <Award size={28} className="mx-auto text-slate-600" />
                          <div className="text-xs font-bold text-slate-300">Generate Spaced Repetition Decks</div>
                          <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                            Extract key terms and definitions from this publication for active memorization loops.
                          </p>
                          <button
                            onClick={handleGenerateCards}
                            className="w-full py-2 bg-brand-primary text-white text-xs font-bold rounded-xl hover:opacity-95 transition-all shadow shadow-brand-primary/10"
                          >
                            Assemble AI Flashcards
                          </button>
                        </div>
                      )}

                      {/* Loading spinner */}
                      {cardsLoading && (
                        <div className="text-center py-12 flex flex-col items-center justify-center text-slate-500 space-y-2">
                          <Loader size={24} className="animate-spin text-brand-secondary" />
                          <span className="text-[10px] font-bold">Generating Flashcard Terms...</span>
                        </div>
                      )}

                      {/* Active Flashcard Viewer */}
                      {flashcards.length > 0 && !cardsLoading && (
                        <div className="space-y-5">
                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                            <span>Card {cardIndex + 1} of {flashcards.length}</span>
                            <span>SR Box: {flashcards[cardIndex]?.box || 1}</span>
                          </div>

                          {/* Flip Card Widget (Draggable card style, transitions front/back) */}
                          <div
                            onClick={() => setCardFlipped(!cardFlipped)}
                            className="h-48 w-full glass-card rounded-2xl border border-slate-800 relative cursor-pointer perspective-1000 select-none flex items-center justify-center p-6 text-center shadow-inner hover:border-brand-primary/40 transition-all"
                          >
                            <button
                              onClick={handleFavoriteCard}
                              className="absolute top-4 right-4 text-slate-500 hover:text-amber-500 transition-all z-10"
                            >
                              <Bookmark
                                size={18}
                                className={flashcards[cardIndex]?.isFavorite ? 'fill-amber-500 text-amber-500' : ''}
                              />
                            </button>

                            {cardFlipped ? (
                              <div className="text-slate-200 text-xs font-semibold leading-relaxed whitespace-pre-wrap animate-in fade-in duration-200">
                                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2">Back / Answer</div>
                                {flashcards[cardIndex]?.back}
                              </div>
                            ) : (
                              <div className="text-white text-xs font-bold leading-relaxed whitespace-pre-wrap animate-in fade-in duration-200">
                                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2">Front / Question</div>
                                {flashcards[cardIndex]?.front}
                              </div>
                            )}
                          </div>

                          {/* Controls logic: Only show feedback score indicators when card is flipped */}
                          {cardFlipped ? (
                            <div className="space-y-2">
                              <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wider block text-center">Rate Recall Accuracy</span>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  onClick={() => handleReviewFeedback(2)}
                                  className="flex items-center justify-center gap-1.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 rounded-xl text-[10px] font-bold text-rose-400 transition-all"
                                >
                                  <ThumbsDown size={14} /> Forgot / Failed
                                </button>
                                <button
                                  onClick={() => handleReviewFeedback(5)}
                                  className="flex items-center justify-center gap-1.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 rounded-xl text-[10px] font-bold text-emerald-400 transition-all"
                                >
                                  <ThumbsUp size={14} /> Recalled / Pass
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                              Click card to flip and view answer key
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workspace;
