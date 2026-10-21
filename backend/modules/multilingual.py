import re
import logging
from deep_translator import GoogleTranslator

logger = logging.getLogger(__name__)

class MultilingualLayer:
    """
    Module 5: Multilingual Evaluation Layer
    Detects language with fast-path script analysis and English stopword heuristics,
    caches translations, and prevents rate-limit errors from deep_translator.
    """
    
    COMMON_ENGLISH_WORDS = {
        'the', 'is', 'are', 'was', 'were', 'what', 'why', 'how', 'when', 'where',
        'who', 'can', 'you', 'explain', 'tell', 'me', 'about', 'solve', 'help',
        'please', 'in', 'on', 'at', 'to', 'for', 'with', 'from', 'by', 'and', 'or',
        'not', 'this', 'that', 'these', 'those', 'a', 'an', 'hello', 'hi', 'hey',
        'math', 'science', 'gravity', 'photosynthesis', 'triangle', 'cell', 'force'
    }

    def __init__(self):
        self.base_lang = 'en'
        self._cache = {}
    
    def detect_language(self, text: str) -> str:
        """Detect language code using fast heuristics first, then langdetect."""
        if not text or len(text.strip()) < 2:
            return self.base_lang
            
        clean_text = text.strip()

        # Unicode script checks for Indian & International languages
        if re.search(r'[\u0900-\u097F]', clean_text):
            return 'hi'  # Hindi / Devanagari
        if re.search(r'[\u0B80-\u0BFF]', clean_text):
            return 'ta'  # Tamil
        if re.search(r'[\u0C00-\u0C7F]', clean_text):
            return 'te'  # Telugu
        if re.search(r'[\u0980-\u09FF]', clean_text):
            return 'bn'  # Bengali
        if re.search(r'[\u0600-\u06FF]', clean_text):
            return 'ar'  # Arabic
        if re.search(r'[\u4E00-\u9FFF]', clean_text):
            return 'zh'  # Chinese
        if re.search(r'[\u3040-\u30FF]', clean_text):
            return 'ja'  # Japanese

        # English fast-path: ASCII characters with common English words
        words = set(re.findall(r'\b[a-zA-Z]{2,}\b', clean_text.lower()))
        if words and (words & self.COMMON_ENGLISH_WORDS or all(ord(c) < 128 for c in clean_text)):
            # If at least one English keyword is found, or it's standard ASCII, treat as English
            if words & self.COMMON_ENGLISH_WORDS:
                return 'en'
            # If ASCII without diacritics and short, assume English
            if len(clean_text) < 50 and all(ord(c) < 128 for c in clean_text):
                return 'en'

        try:
            from langdetect import detect
            code = detect(clean_text)
            # Avoid langdetect false-positives for short English text (e.g. 'nl', 'so', 'af', 'cy')
            if code in {'nl', 'so', 'af', 'cy', 'tl'} and all(ord(c) < 128 for c in clean_text):
                return 'en'
            return code
        except Exception as e:
            logger.warning(f"Language detection fallback to 'en': {e}")
            return self.base_lang

    def translate_to_english(self, text: str, source_lang: str) -> str:
        """Translate native text to English with caching and rate-limit guard."""
        if not text or source_lang == self.base_lang:
            return text
            
        cache_key = f"{source_lang}->en:{text}"
        if cache_key in self._cache:
            return self._cache[cache_key]

        try:
            translator = GoogleTranslator(source=source_lang, target=self.base_lang)
            translated = translator.translate(text)
            if translated:
                self._cache[cache_key] = translated
                return translated
        except Exception as e:
            logger.warning(f"Translation to English failed ({source_lang}): {e}")
            
        return text

    def translate_to_native(self, text: str, target_lang: str) -> str:
        """Translate English text back to native language with caching."""
        if not text or target_lang == self.base_lang:
            return text
            
        cache_key = f"en->{target_lang}:{text}"
        if cache_key in self._cache:
            return self._cache[cache_key]

        try:
            translator = GoogleTranslator(source=self.base_lang, target=target_lang)
            translated = translator.translate(text)
            if translated:
                self._cache[cache_key] = translated
                return translated
        except Exception as e:
            logger.warning(f"Translation to {target_lang} failed: {e}")
            
        return text

multilingual = MultilingualLayer()
