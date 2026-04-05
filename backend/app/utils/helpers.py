from decimal import Decimal


def calculate_fine(book_price: float, due_date, return_date) -> float:
    """
    Calculate the fine amount for a returned book.
    
    Logic:
    - If returned within due_date: 0
    - If late <= 7 days: 10% of book price
    - If late > 7 days: 10% of book price + (extra_days * 10 EGP)
    """
    if return_date <= due_date:
        return 0.0

    days_late = (return_date - due_date).days

    price = float(book_price)
    base_fine = price * 0.10

    if days_late <= 7:
        return base_fine
    else:
        extra_days = days_late - 7
        return base_fine + (extra_days * 10.0)
