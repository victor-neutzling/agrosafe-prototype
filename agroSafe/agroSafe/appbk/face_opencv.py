
from __future__ import annotations

import os
from typing import BinaryIO

import cv2
import numpy as np
from django.conf import settings


def _cascade_path() -> str:
	return os.path.join(cv2.data.haarcascades, 'haarcascade_frontalface_default.xml')


def _largest_face_roi(gray: np.ndarray) -> np.ndarray | None:
	cc = cv2.CascadeClassifier(_cascade_path())
	faces = cc.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(48, 48))
	if len(faces) == 0:
		return None
	x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
	return gray[y : y + h, x : x + w]


def _face_from_bgr(bgr: np.ndarray) -> np.ndarray | None:
	if bgr is None or bgr.size == 0:
		return None
	gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
	gray = cv2.equalizeHist(gray)
	return _largest_face_roi(gray)


def _read_bgr_from_upload(file_obj: BinaryIO) -> np.ndarray | None:
	raw = file_obj.read()
	if not raw:
		return None
	arr = np.frombuffer(raw, dtype=np.uint8)
	return cv2.imdecode(arr, cv2.IMREAD_COLOR)


def _face_hash_from_face(face: np.ndarray) -> str:
	"""
	Gera um hash perceptual binário (aHash) de 64 bits para o rosto.
	"""
	small = cv2.resize(face, (8, 8), interpolation=cv2.INTER_AREA)
	mean_val = float(np.mean(small))
	bits = (small >= mean_val).astype(np.uint8).flatten()
	return ''.join('1' if bit else '0' for bit in bits)


def _hash_similarity(hash_a: str, hash_b: str) -> float:
	if not hash_a or not hash_b or len(hash_a) != len(hash_b):
		return 0.0
	dist = sum(1 for a, b in zip(hash_a, hash_b) if a != b)
	return float(1.0 - (dist / len(hash_a)))


def gerar_hash_rosto_upload(upload_file: BinaryIO) -> tuple[str | None, str]:
	upload_file.seek(0)
	cap = _read_bgr_from_upload(upload_file)
	if cap is None:
		return None, 'foto_captura_invalida'
	face = _face_from_bgr(cap)
	if face is None:
		return None, 'sem_rosto_captura'
	return _face_hash_from_face(face), 'hash_ok'


def comparar_rosto_hash_referencia(
	referencia_hash: str | None,
	upload_file: BinaryIO,
	threshold: float | None = None,
) -> tuple[bool, float, str]:
	"""
	Retorna (bate_com_cadastro, similaridade, mensagem_curta).
	"""
	th = threshold if threshold is not None else getattr(settings, 'FACE_MATCH_HASH_THRESHOLD', 0.78)
	if not referencia_hash:
		return False, 0.0, 'referencia_invalida'
	hash_captura, status = gerar_hash_rosto_upload(upload_file)
	if not hash_captura:
		return False, 0.0, status
	score = _hash_similarity(referencia_hash, hash_captura)
	ok = score >= th
	msg = 'match' if ok else 'nao_match'
	return ok, score, msg
